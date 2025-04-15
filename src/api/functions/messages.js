const Database = require("../constants/sql.js"); // Adjust the path to your database module
const { incrementUserCredit } = require("./credits.js"); // Import the incrementUserCredit function
const { Collection } = require("discord.js");

// Cooldown collection to track user message cooldowns
const messageCooldowns = new Collection();

const cooldownTime = 5000; // Cooldown time in milliseconds (5 seconds)

async function trackMessage(author) {
    const discordId = author.id;
    const discordUsername = author.username;

    // Cooldown logic to prevent spamming
    const lastMessageTime = messageCooldowns.get(discordId);

    if (lastMessageTime && Date.now() - lastMessageTime < cooldownTime) {
        console.log(`User ${discordUsername} is on cooldown.`);
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
            // Award 2 credits to the user
            await incrementUserCredit(discordId, 2, true);
            console.log(`Added 2 credits to user: ${discordUsername}`);
        }

        console.log(`Message count updated for user: ${discordUsername}`);
        return true; // Successfully tracked the message
    } catch (err) {
        console.error("Error updating message count or credits:", err);
        return false; // Failed to track the message
    }
}

module.exports = { trackMessage };