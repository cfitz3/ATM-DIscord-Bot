const Database = require("../constants/sql.js");
const { Collection } = require("discord.js");
const { calculateXPForLevel } = require("../../utils/helperFunctions.js");

const messageCooldowns = new Collection();
const cooldownTime = 5000;

async function trackMessage(author, guild, baseXP = 15) {
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
            let newLevel = currentLevel;

            // Increment levels until the XP is below the next level threshold
            while (currentXP >= calculateXPForLevel(newLevel)) {
                newLevel++;
            }

            // Update the user's level in the database
            const updateLevelQuery = `
                UPDATE message_counts
                SET level = ?
                WHERE discord_id = ?
            `;
            await Database.query(updateLevelQuery, [newLevel, discordId]);

            // Reward the user for leveling up
            console.log(`User ${discordUsername} leveled up to level ${newLevel}!`);

            // Fetch rank-to-role mappings for the guild
            const fetchRankRolesQuery = `
                SELECT rank, role_id
                FROM rank_roles
                WHERE guild_id = ?
            `;
            const rankRoles = await Database.query(fetchRankRolesQuery, [guild.id]);

            // Find the role for the new level
            const rankRole = rankRoles.find(role => role.rank === `Level ${newLevel}`);

            if (rankRole) {
                const role = guild.roles.cache.get(rankRole.role_id);
                if (role) {
                    // Fetch the member
                    const member = await guild.members.fetch(discordId);

                    // Assign the new role
                    await member.roles.add(role);

                    // Remove other rank roles
                    for (const { role_id } of rankRoles) {
                        if (role_id !== rankRole.role_id) {
                            const otherRole = guild.roles.cache.get(role_id);
                            if (otherRole) {
                                await member.roles.remove(otherRole);
                            }
                        }
                    }

                    console.log(`Assigned role ${role.name} to user ${discordUsername} for reaching level ${newLevel}.`);
                }
            }
        }

        return true;
    } catch (err) {
        console.error("Error updating XP or assigning roles:", err);
        return false;
    }
}

module.exports = { trackMessage };