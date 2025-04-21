const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('../../../api/constants/sql.js');
const { adminOnly } = require('./manageSchedules.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setsettings')
        .setDescription('Update one or more server settings for this guild.')
        .addRoleOption(option =>
            option.setName('admin_role')
                .setDescription('The admin role to set.')
        )
        .addRoleOption(option =>
            option.setName('staff_role')
                .setDescription('The staff role to set.')
        )
        .addChannelOption(option =>
            option.setName('log_channel')
                .setDescription('The log channel to set.')
        )
        .addChannelOption(option =>
            option.setName('welcome_channel')
                .setDescription('The welcome channel to set.')
        )
        .addStringOption(option =>
            option.setName('prefix')
                .setDescription('The command prefix to set (1-5 characters).')
        )
        .addIntegerOption(option =>
            option.setName('requirements')
                .setDescription('The numeric requirements value to set.')
        )
        .addIntegerOption(option =>
            option.setName('base_xp')
                .setDescription('The base XP awarded per message.')
        ),

    adminOnly: true,

    async execute(interaction) {
        const guildId = interaction.guildId;

        // Collect all provided options
        const updates = {};
        const adminRole = interaction.options.getRole('admin_role');
        const staffRole = interaction.options.getRole('staff_role');
        const logChannel = interaction.options.getChannel('log_channel');
        const welcomeChannel = interaction.options.getChannel('welcome_channel');
        const prefix = interaction.options.getString('prefix');
        const requirements = interaction.options.getInteger('requirements');
        const baseXP = interaction.options.getInteger('base_xp');

        if (adminRole) updates.admin_role_id = adminRole.id;
        if (staffRole) updates.staff_role_id = staffRole.id;
        if (logChannel) updates.log_channel_id = logChannel.id;
        if (welcomeChannel) updates.welcome_channel_id = welcomeChannel.id;
        if (prefix) {
            if (prefix.length > 5) {
                return interaction.reply({
                    content: '❌ The prefix must be 1-5 characters long.',
                    ephemeral: true,
                });
            }
            updates.prefix = prefix;
        }
        if (requirements !== null) updates.requirements = requirements;
        if (baseXP !== null) {
            if (baseXP < 1) {
                return interaction.reply({
                    content: '❌ The base XP must be at least 1.',
                    ephemeral: true,
                });
            }
            updates.base_xp = baseXP;
        }

        // If no valid options were provided, return an error
        if (Object.keys(updates).length === 0) {
            return interaction.reply({
                content: '❌ You must provide at least one setting to update.',
                ephemeral: true,
            });
        }

        // Dynamically construct the SQL query
        const query = `
            INSERT INTO server_settings (guild_id, ${Object.keys(updates).join(', ')})
            VALUES (?, ${Object.keys(updates).map(() => '?').join(', ')})
            ON DUPLICATE KEY UPDATE ${Object.keys(updates).map(key => `${key} = VALUES(${key})`).join(', ')}
        `;
        const values = [guildId, ...Object.values(updates)];

        // Execute the query
        try {
            await Database.query(query, values);
            await interaction.reply({
                content: `✅ Successfully updated the following settings:\n${Object.entries(updates)
                    .map(([key, value]) => `- **${key.replace(/_/g, ' ')}**: ${value}`)
                    .join('\n')}`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error updating server settings:', error);
            await interaction.reply({
                content: '❌ There was an error updating the server settings. Please try again later.',
                ephemeral: true,
            });
        }
    },
};