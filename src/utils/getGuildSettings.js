const Database = require('../api/constants/sql.js');

async function getGuildSettings(guildId) {
   
    const query = `SELECT * FROM server_settings WHERE guild_id = ?`;
    let rows;
    try {
        rows = await Database.query(query, [guildId]); 
    } catch (error) {
        console.error(`Error fetching settings for guild ${guildId}:`, error);
        throw error; 
    }

    if (!Array.isArray(rows) || rows.length === 0) {
        return {
            prefix: '!',
            admin_role_id: null,
            staff_role_id: null,
            log_channel_id: null,
            welcome_channel_id: null,
            staff_announcements_channel: null,
            requirements: 0,
        };
    }

    return rows[0];
}

module.exports = {
    getGuildSettings,
};