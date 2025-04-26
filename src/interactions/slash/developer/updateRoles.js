const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('../../../api/constants/sql.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('applyroles')
        .setDescription('Retroactively apply rank roles to all users based on their current levels.'),

    devOnly: true,

    async execute(interaction) {
        const guild = interaction.guild;

        await interaction.deferReply({ ephemeral: true });

        try {
            // Fetch all users and their levels
            const fetchUsersQuery = `
                SELECT discord_id, level
                FROM message_counts
            `;
            const users = await Database.query(fetchUsersQuery);

            console.log('Fetched users:', users); // Debugging line

            if (users.length === 0) {
                return interaction.editReply({
                    content: '❌ No users found to apply roles to.',
                });
            }

            // Fetch rank-to-role mappings for the guild
            const fetchRankRolesQuery = `
                SELECT level, role_id
                FROM rank_roles
                WHERE guild_id = ?
            `;
            const rankRoles = await Database.query(fetchRankRolesQuery, [guild.id]);

            console.log('Fetched rank roles:', rankRoles); // Debugging line
            
            if (rankRoles.length === 0) {
                return interaction.editReply({
                    content: '❌ No rank roles configured for this server.',
                });
            }

            // Iterate through users and apply roles
            let updatedCount = 0;

            for (const user of users) {
                const { discord_id, level } = user;

                // Find the role for the user's level
                const rankRole = rankRoles.find(role => role.level === level);

                if (rankRole) {
                    const role = guild.roles.cache.get(rankRole.role_id);
                    if (role) {
                        try {
                            // Fetch the member
                            const member = await guild.members.fetch(discord_id).catch(() => null);

                            if (member) {
                                // Assign the new role
                                await member.roles.add(role);

                                // Remove other rank roles
                                for (const { role_id } of rankRoles) {
                                    if (role_id !== rankRole.role_id) {
                                        const otherRole = guild.roles.cache.get(role_id);
                                        if (otherRole) {
                                            await member.roles.remove(otherRole);
                                        }
                                    }
                                }
                                console.log('Rank Roles:', rankRoles);
console.log(`Processing user ${discord_id} with level ${level}`);

                                updatedCount++;
                                console.log(`Assigned role ${role.name} to user ${member.user.username} (Level ${level}).`);
                            }
                        } catch (error) {
                            console.error(`Error applying role to user ${discord_id}:`, error);
                        }
                    }
                }
            }

            // Reply with the result
            await interaction.editReply({
                content: `✅ Successfully applied rank roles to **${updatedCount}** users.`,
            });
        } catch (error) {
            console.error('Error applying roles:', error);
            await interaction.editReply({
                content: '❌ An error occurred while applying roles. Please check the logs for details.',
            });
        }
    },
};