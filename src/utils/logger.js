const { EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('./getGuildSettings.js');
const Database = require('../api/constants/sql.js'); 

async function logModAction(guild, actionType, target, moderator, reason, channelId = 'unknown') {
    // Fetch guild settings to get the mod log channel
    const guildSettings = await getGuildSettings(guild.id);
    const logChannelId = guildSettings.log_channel_id;

    if (!logChannelId) {
        console.warn(`No mod log channel set for guild ${guild.id}.`);
        return;
    }

    // Fetch the channel from the cache or API
    let logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        try {
            logChannel = await guild.channels.fetch(logChannelId);
        } catch (error) {
            console.warn(`Failed to fetch mod log channel ${logChannelId} in guild ${guild.id}:`, error);
            return;
        }
    }

    // Create the embed for the moderation log
    const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setAuthor({
            name: `${moderator.tag} (ID ${moderator.id})`,
            iconURL: moderator.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
            `🔍 **Action:** ${actionType}\n` +
            `📄 **Reason:** ${reason || 'No reason provided.'}\n` +
            `**Channel:** ${channelId !== 'unknown' ? `<#${channelId}>` : 'Unknown'}`
        )
        .addFields(
            { name: 'Target', value: `${target.tag} (ID ${target.id})`, inline: false }
        )
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    // Send the embed to the mod log channel
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error(`Failed to send mod log message to channel ${logChannelId}:`, err);
    }

    // Insert the action into the mod_actions table
    try {
        await Database.query(
            `INSERT INTO mod_actions (guild_id, user_id, moderator_id, action_type, reason) VALUES (?, ?, ?, ?, ?)`,
            [
                guild.id,
                target.id,
                moderator.id,
                actionType,
                reason || null
            ]
        );
    } catch (dbErr) {
        console.error('Failed to log mod action to database:', dbErr);
    }
}

module.exports = { logModAction };