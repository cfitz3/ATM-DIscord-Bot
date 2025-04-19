const Database = require("../constants/sql.js"); 
const { incrementUserCredit } = require("./credits.js"); 
const { Collection } = require("discord.js");

const messageCooldowns = new Collection();

const cooldownTime = 5000; 

async function trackMessage(author) {
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

    // Update the message count in the `message_counts` table
    const updateMessageCountQuery = `
        INSERT INTO message_counts (discord_id, discord_username, message_count)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE
        message_count = message_count + 1,
        discord_username = VALUES(discord_username)
    `;

    try {
        // Update the message count
        await Database.query(updateMessageCountQuery, [discordId, discordUsername]);

        // Check if the user has reached a multiple of 50 messages
        const checkMessageCountQuery = `
            SELECT message_count
            FROM message_counts
            WHERE discord_id = ?
        `;
        const [result] = await Database.query(checkMessageCountQuery, [discordId]);

        if (result && result.message_count % 50 === 0) {
            await incrementUserCredit(discordId, 2, true);
        }

        return true; 
    } catch (err) {
        console.error("Error updating message count or credits:", err);
        return false; 
    }
}

module.exports = { trackMessage };