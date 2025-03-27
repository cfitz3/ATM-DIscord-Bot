const Database = require('../api/constants/sql.js');

/**
 * Increments the credit for a given user.
 * @param {string} minecraftUsername - The Minecraft username of the user.
 * @param {number} incrementBy - The amount to increment the user's credits by.
 */
async function incrementUserCredit(minecraftUsername, incrementBy) {
  if (!minecraftUsername) {
    console.error('Minecraft username is not defined.');
    throw new Error('Minecraft username is not defined.');
  }

  if (incrementBy === undefined) {
    console.error('incrementBy value is not defined.');
    throw new Error('incrementBy value is not defined.');
  }

  const updateCreditsQuery = 'UPDATE users SET credits = credits + ?, last_awarded = NOW() WHERE minecraft_username = ?';
  const insertCreditsQuery = 'INSERT INTO users (minecraft_username, credits, last_awarded) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE credits = credits + ?, last_awarded = NOW()';

  try {
    const updateResult = await Database.query(updateCreditsQuery, [incrementBy, minecraftUsername]);

    if (updateResult.affectedRows === 0) {
      await Database.query(insertCreditsQuery, [minecraftUsername, incrementBy, incrementBy]);
    }

    console.log(`User with Minecraft username ${minecraftUsername} has been awarded ${incrementBy} credits.`);
    return `You have been awarded ${incrementBy} credits.`;
  } catch (err) {
    console.error('Error incrementing user credits:', err);
    throw err;
  }
}

/**
 * Gets the credit for a given user.
 * @param {string} userId - The user ID of the user.
 * @returns {Promise<string>} - The user's credits as a string.
 */

async function getUserCredits(userId) {
  if (!userId) {
    console.error('User ID is not defined.');
    throw new Error('User ID is not defined.');
  }

  const selectQuery = 'SELECT credits FROM users WHERE discord_id = ?';

  try {
    const results = await Database.query(selectQuery, [userId]);

    if (results.length > 0) {
      // Convert BigInt to string
      const credits = results[0].credits;
      return credits.toString();
    } else {
      return '0'; // Return '0' if user not found
    }
  } catch (err) {
    console.error('Error fetching user credits:', err);
    throw err;
  }
}

/**
 * Gets the Minecraft username for a given user.
 * @param {string} userId - The user ID of the user.
 * @returns {Promise<string>} - The Minecraft username of the user.
 */
async function getMinecraftUsername(userId) {
  if (!userId) {
    console.error('User ID is not defined.');
    throw new Error('User ID is not defined.');
  }

  const selectQuery = 'SELECT minecraft_username FROM users WHERE discord_id = ?';

  try {
    const results = await Database.query(selectQuery, [userId]);

    if (results.length > 0) {
      return results[0].minecraft_username;
    } else {
      return null; // Return null if user not found
    }
  } catch (err) {
    console.error('Error fetching Minecraft username:', err);
    throw err;
  }
}

module.exports = { incrementUserCredit, getUserCredits, getMinecraftUsername };
