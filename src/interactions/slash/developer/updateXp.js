const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('../../../api/constants/sql.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updatexp')
        .setDescription('Developer-only command to update user XP based on historical messages sent.'),
   
    devOnly: true,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Fetch all users with their message counts
            const fetchUsersQuery = `
                SELECT discord_id, message_count
                FROM message_counts
            `;
            const users = await Database.query(fetchUsersQuery);

            if (users.length === 0) {
                return interaction.editReply({ content: 'No users found to update XP for.' });
            }

            // Fetch the global base XP value from server settings
            const fetchBaseXPQuery = `
                SELECT base_xp
                FROM server_settings
                LIMIT 1
            `;
            const [serverSettings] = await Database.query(fetchBaseXPQuery);
            const baseXP = serverSettings?.base_xp || 15; // Default to 15 if not set

            // Update XP for each user
            const updateXPQuery = `
                UPDATE message_counts
                SET xp = ?
                WHERE discord_id = ?
            `;

            let updatedCount = 0;

            for (const user of users) {
                const { discord_id, message_count } = user;
                const newXP = message_count * baseXP;

                await Database.query(updateXPQuery, [newXP, discord_id]);
                updatedCount++;
            }

            // Reply with the result
            await interaction.editReply({
                content: `✅ Successfully updated XP for **${updatedCount}** users based on historical messages.`,
            });
        } catch (err) {
            console.error('Error updating user XP:', err);
            await interaction.editReply({
                content: '❌ An error occurred while updating user XP. Please check the logs for details.',
            });
        }
    },
};