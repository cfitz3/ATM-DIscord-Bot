const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Database = require('../../../api/constants/sql.js'); 
const { createLeaderboardEmbed } = require('../../../responses/embeds/leaderboards.js'); 
const { oopsie } = require('../../../utils/errorHandler.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the top users by their message count and credits.'),
    
    linked: true, 

        async execute(interaction) {
            
        const leaderboardQuery = `
            SELECT u.discord_id, u.discord_username, u.credits, mc.message_count
            FROM users u
            LEFT JOIN message_counts mc ON u.discord_id = mc.discord_id
            ORDER BY mc.message_count DESC, u.credits DESC
        `;

        const userRankQuery = `
            SELECT rank, discord_id, discord_username, credits, message_count
            FROM (
                SELECT RANK() OVER (ORDER BY COALESCE(mc.message_count, 0) DESC) AS rank,
                       u.discord_id, u.discord_username, u.credits, COALESCE(mc.message_count, 0) AS message_count
                FROM users u
                LEFT JOIN message_counts mc ON u.discord_id = mc.discord_id
            ) ranked
            WHERE discord_id = ?
        `;

        try {
            const leaderboardResults = await Database.query(leaderboardQuery);

            if (leaderboardResults.length === 0) {
                return await interaction.reply({ content: 'No data found for the leaderboard.', ephemeral: true });
            }

            const [userRankResult] = await Database.query(userRankQuery, [interaction.user.id]);
           

            const userRank = userRankResult
                ? {
                      rank: userRankResult.rank,
                      message_count: userRankResult.message_count || 0,
                      credits: userRankResult.credits || 0,
                  }
                : null;

            const itemsPerPage = 5;
            let currentPage = 1;
            const embed = createLeaderboardEmbed(leaderboardResults, userRank, currentPage, itemsPerPage);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true), 
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(leaderboardResults.length <= itemsPerPage)
            );

            const message = await interaction.reply({
                embeds: [embed],
                components: [row],
                fetchReply: true,
            });

            const collector = message.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 60000, 
            });

            collector.on('collect', async (i) => {
                if (i.customId === 'previous') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }

                const updatedEmbed = createLeaderboardEmbed(leaderboardResults, userRank, currentPage, itemsPerPage);
                const updatedRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 1),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === Math.ceil(leaderboardResults.length / itemsPerPage))
                );

                await i.update({ embeds: [updatedEmbed], components: [updatedRow] });
            });

            collector.on('end', async () => {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );

                await message.edit({ components: [disabledRow] });
            });
        } catch (err) {
            console.error('Error fetching leaderboard data:', err);
            await oopsie(interaction, err); 
        }
        },
    };
    