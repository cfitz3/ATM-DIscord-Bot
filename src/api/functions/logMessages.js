const Database = require("../constants/sql.js");

async function logMessage(message) {
    // Ensure the message object is valid and has an author
    if (!message || !message.author || message.author.bot) {
        return false; // Ignore invalid messages or messages from bots
    }

    const discordId = message.author.id;
    const discordUsername = message.author.username;
    const messageContent = message.content;
    const channelId = message.channel.id;
    const guildId = message.guild?.id || "DM";

    // SQL query to insert the message into the `message_logs` table
    const logMessageQuery = `
        INSERT INTO message_logs (discord_id, discord_username, message_content, channel_id, guild_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        // Log the message content
        await Database.query(logMessageQuery, [discordId, discordUsername, messageContent, channelId, guildId]);
        return true;
    } catch (err) {
        console.error("Error logging message:", err);
        return false;
    }
}

module.exports = { logMessage };