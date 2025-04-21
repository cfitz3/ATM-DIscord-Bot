const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../../../api/constants/sql.js');
const { calculateXPForLevel } = require('../../../utils/helperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your current level and XP.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view the rank for.')
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;

        // Fetch the user's XP and level
        const query = `
            SELECT xp, level
            FROM message_counts
            WHERE discord_id = ?
        `;
        const [user] = await Database.query(query, [target.id]);

        if (!user) {
            return interaction.reply({ content: `❌ No data found for <@${target.id}>.`, ephemeral: true });
        }

        const currentXP = user.xp;
        const currentLevel = user.level;

        // Calculate XP for the current level and the next level
        const xpForCurrentLevel = calculateXPForLevel(currentLevel - 1) || 0; // XP required to reach the current level
        const xpForNextLevel = calculateXPForLevel(currentLevel); // XP required to reach the next level
        const progressXP = currentXP - xpForCurrentLevel; // XP progress within the current level
        const levelXP = xpForNextLevel - xpForCurrentLevel; // Total XP required for the current level

        const progress = ((progressXP / levelXP) * 100).toFixed(2);

        // Create an embed to display the rank
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`Rank for ${target.tag}`)
            .setDescription(`Level: **${currentLevel}**\nXP: **${progressXP}/${levelXP}** (${progress}%)`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};