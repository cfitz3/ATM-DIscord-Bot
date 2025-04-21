const Database = require("../constants/sql.js");
const { incrementUserCredit } = require("./credits.js");
const { Collection } = require("discord.js");
const { calculateXPForLevel } = require("../../utils/helperFunctions.js");

const messageCooldowns = new Collection();
const cooldownTime = 5000;

async function trackMessage(author, baseXP = 15) {
    const discordId = author.id;
    const discordUsername = author.username;

    // Cooldown logic to prevent spamming
    const lastMessageTime = messageCooldowns.get(discordId);

    if (lastMessageTime && Date.now() - lastMessageTime < cooldownTime) {
        return false; // User is on cooldown, skip tracking
    }

    // Update the cooldown for the user
    messageCooldowns.set(discordId, Date.now());
    setTimeout(() => messageCooldowns.delete(discordId), cooldownTime);

    // Update the XP in the `message_counts` table
    const updateMessageCountQuery = `
        INSERT INTO message_counts (discord_id, discord_username, message_count, xp, level)
        VALUES (?, ?, 1, ?, 1)
        ON DUPLICATE KEY UPDATE
        message_count = message_count + 1,
        xp = xp + VALUES(xp),
        discord_username = VALUES(discord_username)
    `;

    try {
        // Update the XP
        await Database.query(updateMessageCountQuery, [discordId, discordUsername, baseXP]);

        // Fetch the user's current XP and level
        const fetchUserQuery = `
            SELECT xp, level
            FROM message_counts
            WHERE discord_id = ?
        `;
        const [user] = await Database.query(fetchUserQuery, [discordId]);

        const currentXP = user.xp;
        const currentLevel = user.level;
        const xpForNextLevel = calculateXPForLevel(currentLevel);

        // Check if the user leveled up
        if (currentXP >= xpForNextLevel) {
            const newLevel = currentLevel + 1;

            // Update the user's level
            const updateLevelQuery = `
                UPDATE message_counts
                SET level = ?
                WHERE discord_id = ?
            `;
            await Database.query(updateLevelQuery, [newLevel, discordId]);

            // Reward the user for leveling up
            console.log(`User ${discordUsername} leveled up to level ${newLevel}!`);
        }

        return true;
    } catch (err) {
        console.error("Error updating XP or credits:", err);
        return false;
    }
}

module.exports = { trackMessage };