const { EmbedBuilder } = require('discord.js');

function createLeaderboardEmbed(leaderboardData, userRank = null, page = 1, itemsPerPage = 5) {
    const embed = new EmbedBuilder()
        .setTitle('🏆 Server Leaderboard')
        .setColor('#E0CCC0')
        .setTimestamp()
        .setFooter({ text: 'Earn more XP by participating in the server!' });

    if (userRank) {
        embed.addFields({
            name: 'Your Rank',
            value: `You are rank **#${userRank.rank}** with **${userRank.xp} XP** and are at **Level ${userRank.level}**.`,
            inline: false,
        });
    }

    const startIndex = (page - 1) * itemsPerPage;
    const paginatedData = leaderboardData.slice(startIndex, startIndex + itemsPerPage);

    paginatedData.forEach((user, index) => {
        embed.addFields({
            name: `${startIndex + index + 1}. ${user.discord_username || 'Unknown User'}`,
            value: `\`${user.xp || 0} XP | Level ${user.level || 1}\``,
            inline: false,
        });
    });

    embed.setFooter({ text: `Page ${page} of ${Math.ceil(leaderboardData.length / itemsPerPage)}` });
    return embed;
}

module.exports = {
    createLeaderboardEmbed,
};