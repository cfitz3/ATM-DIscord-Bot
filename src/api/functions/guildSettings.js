const Database = require('../api/constants/sql.js');

const guildSettingsCache = new Map();
const cacheExpiry = new Map(); // To track expiry times
const CACHE_LIFETIME = 5 * 60 * 1000; // 5 minutes

async function getGuildSettings(guildId) {
    const now = Date.now();

    // Check if the cache is still valid
    if (guildSettingsCache.has(guildId) && cacheExpiry.get(guildId) > now) {
        return guildSettingsCache.get(guildId);
    }

    // Fetch from the database and update the cache
    const query = `SELECT * FROM server_settings WHERE guild_id = ?`;
    const [rows] = await Database.query(query, [guildId]);

    const guildSettings = rows.length > 0 ? rows[0] : {
        prefix: '!',
        admin_role_id: null,
        staff_role_id: null,
        log_channel_id: null,
        welcome_channel_id: null,
        whitelist_role: null,
        guest_role: null,
        join_requests_channel: null,
        staff_announcements_channel: null,
        requirements: 0,
    };

    guildSettingsCache.set(guildId, guildSettings);
    cacheExpiry.set(guildId, now + CACHE_LIFETIME); // Set expiry time

    return guildSettings;
}

function updateGuildSettingsCache(guildId, updatedSettings) {
    const now = Date.now();
    guildSettingsCache.set(guildId, updatedSettings);
    cacheExpiry.set(guildId, now + CACHE_LIFETIME); // Refresh expiry time
}

module.exports = {
    getGuildSettings,
    updateGuildSettingsCache,
};