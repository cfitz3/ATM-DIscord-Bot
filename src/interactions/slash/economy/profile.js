const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const Database = require('../../../api/constants/sql.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your profile.'),

    linked: true,

    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Fetch user stats (wallet, XP, level, and rank)
            const userStatsQuery = `
                SELECT rank, discord_id, xp, level, credits
                FROM (
                    SELECT RANK() OVER (ORDER BY COALESCE(mc.xp, 0) DESC, COALESCE(mc.level, 0) DESC) AS rank,
                           u.discord_id, COALESCE(mc.xp, 0) AS xp, COALESCE(mc.level, 0) AS level, u.credits
                    FROM users u
                    LEFT JOIN message_counts mc ON u.discord_id = mc.discord_id
                ) ranked
                WHERE discord_id = ?
            `;
            const [userStats] = await Database.query(userStatsQuery, [userId]);

            if (!userStats) {
                return interaction.reply({
                    content: '❌ Your stats could not be found. Please try again later.',
                    ephemeral: true,
                });
            }

            // Fetch the equipped cosmetic and its background
            const equippedCosmeticQuery = `
                SELECT COALESCE(c.background_url, 'https://i.imgur.com/TERRBR9.png') AS background_url
                FROM user_cosmetics uc
                JOIN cosmetics c ON uc.cosmetic_id = c.id
                WHERE uc.discord_id = ? AND uc.equipped = TRUE
            `;
            const [equippedCosmetic] = await Database.query(equippedCosmeticQuery, [userId]);

            // Load the background image
            const backgroundUrl = equippedCosmetic ? equippedCosmetic.background_url : 'https://i.imgur.com/TERRBR9.png';
            let backgroundImage;

            try {
                backgroundImage = await loadImage(backgroundUrl);
            } catch (error) {
                console.error(`Error loading background image: ${backgroundUrl}`, error);
                backgroundImage = await loadImage('https://i.imgur.com/TERRBR9.png'); // Fallback
            }

            // Create a canvas
            const canvas = createCanvas(800, 300);
            const ctx = canvas.getContext('2d');

            // Draw the background
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            // Draw the user's avatar
            const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });
            const avatarImage = await loadImage(avatarUrl);
            ctx.save();
            ctx.beginPath();
            ctx.arc(80, 150, 64, 0, Math.PI * 2); // Circular clipping for the avatar
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImage, 16, 86, 128, 128); // Adjusted position
            ctx.restore();

            // Draw a semi-transparent background for the text
            const textBoxX = 180;
            const textBoxY = 50;
            const textBoxWidth = 600;
            const textBoxHeight = 200;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Black with 60% opacity
            ctx.fillRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight);

            // Draw the user's profile data
            ctx.font = 'bold 24px Arial'; // Default font
            ctx.fillStyle = '#ffffff'; // White text
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 6;

            // Draw the profile title
            const padding = 20;
            ctx.fillText(`${interaction.user.username}'s Profile`, textBoxX + padding, textBoxY + padding);

            // Draw the stats
            ctx.font = '20px Arial'; // Default font for stats
            ctx.shadowBlur = 4; // Reduce shadow blur for smaller text
            const lineHeight = 34;
            ctx.fillText(`💰 Wallet: ${userStats.credits} Credits`, textBoxX + padding, textBoxY + padding + lineHeight);
            ctx.fillText(`✨ XP: ${userStats.xp || 0}`, textBoxX + padding, textBoxY + padding + 2 * lineHeight);
            ctx.fillText(`🚀 Level: ${userStats.level || 0}`, textBoxX + padding, textBoxY + padding + 3 * lineHeight);
            ctx.fillText(`🏅 Rank: #${userStats.rank || 'N/A'}`, textBoxX + padding, textBoxY + padding + 4 * lineHeight);

            // Convert the canvas to a buffer
            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile.png' });

            // Send the image as an attachment
            return interaction.reply({ files: [attachment] });
        } catch (error) {
            console.error('Error fetching profile:', error);

            return interaction.reply({
                content: '❌ An error occurred while fetching your profile. Please try again later.',
                ephemeral: true,
            });
        }
    },
};