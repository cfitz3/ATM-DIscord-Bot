const { EmbedBuilder } = require('discord.js');

function createLeaderboardEmbed(leaderboardData, userRank = null, page = 1, itemsPerPage = 5) {
    const embed = new EmbedBuilder()
        .setTitle('🏆 Server Leaderboard')
        .setColor('#E0CCC0') 
        .setTimestamp()
        .setFooter({ text: 'Earn more credits by participating in the server!' });

    if (userRank) {
        embed.addFields({
            name: '<:aducat:1355842273950171176> Your Rank',
            value: `You are rank **#${userRank.rank}** on this server with a total of **${userRank.message_count}** messages and **${userRank.credits}** credits.`,
            inline: false,
        });
    }

    const startIndex = (page - 1) * itemsPerPage;
    const paginatedData = leaderboardData.slice(startIndex, startIndex + itemsPerPage);

    paginatedData.forEach((user, index) => {
        embed.addFields({
            name: `${startIndex + index + 1}. ${user.discord_username || 'Unknown User'}`,
            value: `\`${user.message_count || 0} Server Score | ${user.credits} Credits\``,
            inline: false,
        });
    });

    embed.setFooter({ text: `Page ${page} of ${Math.ceil(leaderboardData.length / itemsPerPage)}` });
    return embed;
}

module.exports = {
    createLeaderboardEmbed,
};