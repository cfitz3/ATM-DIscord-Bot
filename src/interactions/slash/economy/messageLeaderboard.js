const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Database = require('../../../api/constants/sql.js'); // Adjust the path to your database module
const { createLeaderboardEmbed } = require('../../../responses/embeds/leaderboards.js'); // Import the embed logic

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the top users by their message count and credits.'),

    async execute(interaction) {
        const userId = interaction.user.id; // Get the ID of the user who ran the command

        const leaderboardQuery = `
            SELECT u.discord_id, u.discord_username, u.credits, mc.message_count
            FROM users u
            LEFT JOIN message_counts mc ON u.discord_id = mc.discord_id
            ORDER BY mc.message_count DESC, u.credits DESC
        `;

        const userRankQuery = `
            SELECT RANK() OVER (ORDER BY mc.message_count DESC, u.credits DESC) AS rank,
                   u.discord_id, u.discord_username, u.credits, mc.message_count
            FROM users u
            LEFT JOIN message_counts mc ON u.discord_id = mc.discord_id
            WHERE u.discord_id = ?
        `;

        try {
            // Fetch all leaderboard data
            const leaderboardResults = await Database.query(leaderboardQuery);

            if (leaderboardResults.length === 0) {
                return await interaction.reply({ content: 'No data found for the leaderboard.', ephemeral: true });
            }

            // Fetch the user's rank
            const [userRankResult] = await Database.query(userRankQuery, [userId]);
            const userRank = userRankResult
                ? {
                      rank: userRankResult.rank,
                      message_count: userRankResult.message_count || 0,
                      credits: userRankResult.credits || 0,
                  }
                : null;

            // Pagination variables
            const itemsPerPage = 5;
            let currentPage = 1;

            // Create the initial embed
            const embed = createLeaderboardEmbed(leaderboardResults, userRank, currentPage, itemsPerPage);

            // Create buttons for pagination
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true), // Disabled on the first page
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(leaderboardResults.length <= itemsPerPage) // Disabled if there's only one page
            );

            // Send the initial embed with buttons
            const message = await interaction.reply({
                embeds: [embed],
                components: [row],
                fetchReply: true,
            });

            // Create a collector for button interactions
            const collector = message.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 60000, // 1 minute
            });

            collector.on('collect', async (i) => {
                if (i.customId === 'previous') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }

                // Update the embed and buttons
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
                // Disable buttons after the collector ends
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
            console.error('Error fetching leaderboard:', err);
            await interaction.reply({
                content: 'An error occurred while fetching the leaderboard. Please try again later.',
                ephemeral: true,
            });
        }
    },
};