const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../../../utils/getGuildSettings.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewsettings')
        .setDescription('View the current guild-specific settings for this server.'),

    adminOnly: true,
    
    async execute(interaction) {
        const guildId = interaction.guildId;

        // Fetch guild settings from the database
        console.log(`Fetching settings for guild ${guildId}...`);
        const guildSettings = await getGuildSettings(guildId);
        console.log(`Fetched settings for guild ${guildId}:`, guildSettings);

        // Create an embed to display the settings
        const settingsEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Current Guild Settings')
            .setDescription('Here are the current settings for this server:')
            .addFields(
            { name: 'Prefix', value: `\`${guildSettings.prefix || '!'}\``, inline: true },
            { name: 'Admin Role', value: guildSettings.admin_role_id ? `<@&${guildSettings.admin_role_id}>` : '`Not Set`', inline: true },
            { name: 'Staff Role', value: guildSettings.staff_role_id ? `<@&${guildSettings.staff_role_id}>` : '`Not Set`', inline: true },
            { name: 'Log Channel', value: guildSettings.log_channel_id ? `<#${guildSettings.log_channel_id}>` : '`Not Set`', inline: true },
            { name: 'Welcome Channel', value: guildSettings.welcome_channel_id ? `<#${guildSettings.welcome_channel_id}>` : '`Not Set`', inline: true },
            { name: 'Staff Announcements Channel', value: guildSettings.staff_announcements_channel ? `<#${guildSettings.staff_announcements_channel}>` : '`Not Set`', inline: true },
            { name: 'Base Server XP', value: `\`${guildSettings.base_xp || 0}\``, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        // Reply with the embed
        await interaction.reply({
            embeds: [settingsEmbed],
            ephemeral: true, // Only visible to the user who ran the command
        });
    },
};