const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('../../../api/constants/sql.js');

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
        )
        .addStringOption(option =>
            option.setName('rank')
                .setDescription('The rank to configure (e.g., Bronze, Silver, Gold).')
        )
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('The level required to achieve this rank.')
        )
        .addRoleOption(option =>
            option.setName('rank_role')
                .setDescription('The Discord role to associate with this rank.')
        ),



    async execute(interaction) {
        const guildId = interaction.guildId;

        
    // Check if the user is the server owner
    if (interaction.user.id !== interaction.guild.ownerId) {
        return interaction.reply({
            content: '❌ You must be the server owner to configure settings.',
            ephemeral: true,
        });
    }

        // Collect all provided options
        const updates = {};
        const adminRole = interaction.options.getRole('admin_role');
        const staffRole = interaction.options.getRole('staff_role');
        const logChannel = interaction.options.getChannel('log_channel');
        const welcomeChannel = interaction.options.getChannel('welcome_channel');
        const prefix = interaction.options.getString('prefix');
        const requirements = interaction.options.getInteger('requirements');
        const baseXP = interaction.options.getInteger('base_xp');
        const rank = interaction.options.getString('rank');
        const level = interaction.options.getInteger('level');
        const rankRole = interaction.options.getRole('rank_role');

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

        // Handle rank-to-role mapping
        if (rank && level !== null && rankRole) {
            try {
                const rankRoleQuery = `
                    INSERT INTO rank_roles (guild_id, rank, level, role_id)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE level = VALUES(level), role_id = VALUES(role_id)
                `;
                await Database.query(rankRoleQuery, [guildId, rank, level, rankRole.id]);

                return interaction.reply({
                    content: `✅ Successfully associated the rank **${rank}** (Level ${level}) with the role **${rankRole.name}**.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error('Error setting rank role:', error);
                return interaction.reply({
                    content: '❌ An error occurred while setting the rank role. Please try again later.',
                    ephemeral: true,
                });
            }
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