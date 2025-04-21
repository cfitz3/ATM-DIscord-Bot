const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Database = require('../../../api/constants/sql.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modlog')
        .setDescription('View moderation history for a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view the modlog for.')
                .setRequired(true)
        ),

    staffOnly: true, 

    async execute(interaction) {
        const target = interaction.options.getUser('user');

        // Fetch moderation actions from the database
        const query = `
            SELECT * FROM mod_actions
            WHERE user_id = ?
            ORDER BY timestamp DESC
        `;
        const actions = await Database.query(query, [target.id]);

        if (actions.length === 0) {
            return interaction.reply({ content: `❌ No moderation history found for <@${target.id}>.`, ephemeral: true });
        }

        // Create an embed to display the modlog
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`Moderation History for ${target.tag}`)
            .setDescription(actions.map(action => 
                `**Action:** ${action.action_type}\n**Reason:** ${action.reason}\n**Moderator:** <@${action.moderator_id}>\n**Date:** ${new Date(action.timestamp).toLocaleString()}`
            ).join('\n\n'))
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};