const { SlashCommandBuilder } = require('@discordjs/builders');
const { getAllUserCredits } = require('../../../api/functions/credits.js'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creditsleaderboard')
        .setDescription('Displays the credits leaderboard for all users.'),
    ownerOnly: true, // Optional: Restrict this command to the bot owner

    async execute(interaction) {
        try {
            // Fetch all user credits
            const users = await getAllUserCredits();

            if (users.length === 0) {
                await interaction.reply({ content: 'No users found in the database.', ephemeral: true });
                return;
            }

            // Format the leaderboard
            const leaderboard = users
                .map((user, index) => `${index + 1}. User ID: ${user.discord_id} - ${user.credits} credits`)
                .join('\n');

            // Reply with the leaderboard
            await interaction.reply({
                content: `**Credits Leaderboard:**\n${leaderboard}`,
                ephemeral: false, // Set to true if you want only the user to see it
            });
        } catch (error) {
            console.error('Error fetching credits leaderboard:', error);
            await interaction.reply({
                content: 'An error occurred while fetching the credits leaderboard. Please try again later.',
                ephemeral: true,
            });
        }
    },
};