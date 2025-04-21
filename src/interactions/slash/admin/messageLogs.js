const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../../../api/constants/sql.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messagelogs')
        .setDescription('View the message logs for a specific user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view the message logs for.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('The number of messages to display (default: 10).')
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const limit = interaction.options.getInteger('limit') || 10;

        // Query the database for the user's message logs
        const query = `
            SELECT message_content, channel_id, timestamp
            FROM message_logs
            WHERE discord_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        `;

        try {
            const logs = await Database.query(query, [target.id, limit]);

            if (logs.length === 0) {
                return interaction.reply({
                    content: `❌ No message logs found for <@${target.id}>.`,
                    ephemeral: true,
                });
            }

            // Create an embed to display the logs
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle(`Message Logs for ${target.tag}`)
                .setDescription(
                    logs
                        .map(
                            (log, index) =>
                                `**${index + 1}.** [<#${log.channel_id}>] (${new Date(
                                    log.timestamp
                                ).toLocaleString()}):\n${log.message_content}`
                        )
                        .join('\n\n')
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (err) {
            console.error('Error fetching message logs:', err);
            await interaction.reply({
                content: '❌ There was an error fetching the message logs. Please try again later.',
                ephemeral: true,
            });
        }
    },
};