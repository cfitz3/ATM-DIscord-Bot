const Database = require('../../../api/constants/sql.js');
const { calculateXPForLevel } = require('../../../utils/helperFunctions.js');

async function recalculateLevels() {
    try {
        // Fetch all users with their XP
        const query = `SELECT discord_id, xp FROM message_counts`;
        const users = await Database.query(query);

        for (const user of users) {
            const { discord_id, xp } = user;

            // Recalculate the level based on XP
            let level = 0;
            while (xp >= calculateXPForLevel(level)) {
                level++;
            }
            level--; // Adjust because the loop exits one level too high

            // Ensure the level is not negative
            if (level < 0) {
                level = 0;
            }

            // Update the user's level in the database
            const updateQuery = `UPDATE message_counts SET level = ? WHERE discord_id = ?`;
            await Database.query(updateQuery, [level, discord_id]);

            console.log(`Updated level for user ${discord_id}: Level ${level}`);
        }

        console.log('Level recalculation complete.');
    } catch (error) {
        console.error('Error recalculating levels:', error);
    }
}

recalculateLevels();