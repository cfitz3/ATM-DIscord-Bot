const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../../../api/constants/sql.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewsettings')
        .setDescription('View the current guild-specific settings for this server.'),

    adminOnly: true,

    async execute(interaction) {
        const guildId = interaction.guildId;

        try {
            // Fetch general server settings
            const fetchSettingsQuery = `
                SELECT prefix, admin_role_id, staff_role_id, log_channel_id, welcome_channel_id, base_xp, requirements
                FROM server_settings
                WHERE guild_id = ?
            `;
            const [settings] = await Database.query(fetchSettingsQuery, [guildId]);

            // Fetch rank-to-role mappings
            const fetchRankRolesQuery = `
                SELECT rank, level, role_id
                FROM rank_roles
                WHERE guild_id = ?
            `;
            const rankRoles = await Database.query(fetchRankRolesQuery, [guildId]);

            // Create the embed to display the settings
            const settingsEmbed = new EmbedBuilder()
                .setColor('Random')
                .setTitle('Current Guild Settings')
                .setDescription('Here are the current settings for this server:')
                .addFields(
                    { name: 'Prefix', value: `\`${settings?.prefix || '!'}\``, inline: true },
                    { name: 'Admin Role', value: settings?.admin_role_id ? `<@&${settings.admin_role_id}>` : '`Not Set`', inline: true },
                    { name: 'Staff Role', value: settings?.staff_role_id ? `<@&${settings.staff_role_id}>` : '`Not Set`', inline: true },
                    { name: 'Log Channel', value: settings?.log_channel_id ? `<#${settings.log_channel_id}>` : '`Not Set`', inline: true },
                    { name: 'Welcome Channel', value: settings?.welcome_channel_id ? `<#${settings.welcome_channel_id}>` : '`Not Set`', inline: true },
                    { name: 'Base XP', value: `\`${settings?.base_xp || 15}\``, inline: true },
                    { name: 'Requirements', value: `\`${settings?.requirements || 0}\``, inline: true }
                );

            // Add rank-to-role mappings to the embed
            if (rankRoles.length > 0) {
                const rankRolesField = rankRoles
                    .map(rankRole => `**${rankRole.rank}** (Level ${rankRole.level}): <@&${rankRole.role_id}>`)
                    .join('\n');
                settingsEmbed.addFields({ name: 'Rank Roles', value: rankRolesField, inline: false });
            } else {
                settingsEmbed.addFields({ name: 'Rank Roles', value: '`No rank roles configured.`', inline: false });
            }

            // Send the embed
            await interaction.reply({
                embeds: [settingsEmbed],
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error fetching guild settings:', error);
            await interaction.reply({
                content: '❌ An error occurred while fetching the guild settings. Please try again later.',
                ephemeral: true,
            });
        }
    },
};