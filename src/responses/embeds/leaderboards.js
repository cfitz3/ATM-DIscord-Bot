const { EmbedBuilder } = require('discord.js');

/**
 * Creates an embed for the credits and message count leaderboard.
 * @param {Array} leaderboardData - Array of leaderboard entries, each containing discord_id, discord_username, credits, and message_count.
 * @param {Object} userRank - Object containing the user's rank and their total messages/credits (optional).
 * @param {number} page - The current page number (1-based).
 * @param {number} itemsPerPage - The number of items to display per page.
 * @returns {EmbedBuilder} - A Discord embed displaying the leaderboard.
 */
function createLeaderboardEmbed(leaderboardData, userRank = null, page = 1, itemsPerPage = 5) {
    const embed = new EmbedBuilder()
        .setTitle('🏆 Server Leaderboard')
        .setColor('#FFD700') // Gold color
        .setTimestamp()
        .setFooter({ text: 'Earn more credits by participating in the server!' });

    // Add user's rank if provided
    if (userRank) {
        embed.addFields({
            name: '<:aducat:1355842273950171176> Your Rank',
            value: `You are rank **#${userRank.rank}** on this server with a total of **${userRank.message_count}** messages and **${userRank.credits}** credits.`,
            inline: false,
        });
    }

    // Paginate leaderboard entries
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedData = leaderboardData.slice(startIndex, startIndex + itemsPerPage);

    paginatedData.forEach((user, index) => {
        embed.addFields({
            name: `${startIndex + index + 1}. ${user.discord_username || 'Unknown User'}`,
            value: `\`${user.message_count || 0} Messages | ${user.credits} Credits\``,
            inline: false,
        });
    });

    embed.setFooter({ text: `Page ${page} of ${Math.ceil(leaderboardData.length / itemsPerPage)}` });

    return embed;
}

module.exports = {
    createLeaderboardEmbed,
};