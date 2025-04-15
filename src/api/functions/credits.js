const Database = require('../constants/sql.js');

/**
 * Increments the credit for a given user.
 * @param {string} minecraftUsername - The Minecraft username of the user.
 * @param {number} incrementBy - The amount to increment the user's credits by.
 */
async function incrementUserCredit(identifier, incrementBy, isDiscordId = false) {
  if (!identifier) {
    console.error('Identifier (Minecraft username or Discord ID) is not defined.');
    throw new Error('Identifier is not defined.');
  }

  if (incrementBy === undefined) {
    console.error('incrementBy value is not defined.');
    throw new Error('incrementBy value is not defined.');
  }

  const column = isDiscordId ? 'discord_id' : 'minecraft_username';
  const updateCreditsQuery = `UPDATE users SET credits = credits + ?, last_awarded = NOW() WHERE ${column} = ?`;
  const insertCreditsQuery = `INSERT INTO users (${column}, credits, last_awarded) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE credits = credits + ?, last_awarded = NOW()`;

  try {
    const updateResult = await Database.query(updateCreditsQuery, [incrementBy, identifier]);

    if (updateResult.affectedRows === 0) {
      await Database.query(insertCreditsQuery, [identifier, incrementBy, incrementBy]);
    }

    console.log(`User with ${column} ${identifier} has been awarded ${incrementBy} credits.`);
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

/**
 * Deducts credits for a given user and optionally logs a purchase.
 * @param {string} identifier - The Minecraft username or Discord ID of the user.
 * @param {number} deductBy - The amount to deduct from the user's credits.
 * @param {boolean} isDiscordId - Whether the identifier is a Discord ID (default: false).
 * @param {string} [purchasedItem] - The name of the item purchased (optional).
 */
async function deductUserCredits(identifier, deductBy, isDiscordId = false, purchasedItem = null) {
  if (!identifier) {
    console.error('Identifier (Minecraft username or Discord ID) is not defined.');
    throw new Error('Identifier is not defined.');
  }

  if (deductBy === undefined || deductBy <= 0) {
    console.error('deductBy value is not valid.');
    throw new Error('deductBy value is not valid.');
  }

  const column = isDiscordId ? 'discord_id' : 'minecraft_username';
  const deductCreditsQuery = `
    UPDATE users 
    SET credits = credits - ? 
    WHERE ${column} = ? AND credits >= ?
  `;
  const logPurchaseQuery = `
    INSERT INTO purchases (discord_id, item_name, purchase_date) 
    VALUES (?, ?, NOW())
  `;

  try {
    // Deduct credits
    const deductResult = await Database.query(deductCreditsQuery, [deductBy, identifier, deductBy]);

    if (deductResult.affectedRows === 0) {
      console.error(`Insufficient credits or user not found for ${column}: ${identifier}`);
      throw new Error('Insufficient credits or user not found.');
    }

    // Log the purchase
    if (purchasedItem) {
      const discordId = isDiscordId ? identifier : await getDiscordIdFromMinecraftUsername(identifier);
      await Database.query(logPurchaseQuery, [discordId, purchasedItem]);
    }

    console.log(`User with ${column} ${identifier} has been deducted ${deductBy} credits and purchased ${purchasedItem}.`);
    return `You have been deducted ${deductBy} credits and purchased ${purchasedItem}.`;
  } catch (err) {
    console.error('Error deducting user credits or logging purchase:', err);
    throw err;
  }
}

async function getPurchaseHistory(discordId) {
  const query = `
    SELECT item_name, purchase_date 
    FROM purchases 
    WHERE discord_id = ? 
    ORDER BY purchase_date DESC
  `;

  try {
    const results = await Database.query(query, [discordId]);
    return results;
  } catch (err) {
    console.error('Error fetching purchase history:', err);
    throw err;
  }
}

async function hasPurchasedItem(discordId, itemName) {
  const query = `
    SELECT COUNT(*) AS count 
    FROM purchases 
    WHERE discord_id = ? AND item_name = ?
  `;

  try {
    const [result] = await Database.query(query, [discordId, itemName]);
    return result.count > 0; // Returns true if the item has been purchased
  } catch (err) {
    console.error('Error checking purchase history:', err);
    throw err;
  }
}

async function getAllUserCredits() {
  const query = `
      SELECT discord_id, credits 
      FROM users
      ORDER BY credits DESC
  `;

  try {
      const results = await Database.query(query);
      return results; // Returns an array of users with their credits
  } catch (err) {
      console.error('Error fetching user credits:', err);
      throw err;
  }
}


module.exports = { incrementUserCredit, getUserCredits, getMinecraftUsername, deductUserCredits, getPurchaseHistory, hasPurchasedItem, getAllUserCredits};
