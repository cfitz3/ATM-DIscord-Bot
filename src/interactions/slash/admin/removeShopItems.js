const { SlashCommandBuilder } = require('discord.js');
const Database = require('../../../api/constants/sql.js');
const { adminOnly } = require('./manageSchedules.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeshopitem')
        .setDescription('Remove an item from the server shop.')
        .addStringOption(option =>
            option.setName('item_name')
                .setDescription('The name of the item to remove.')
                .setRequired(true)
        ),

    adminOnly: true,

    async execute(interaction) {
        const itemName = interaction.options.getString('item_name');
        const guildId = interaction.guildId;

        try {
            // Check if the item exists in the shop
            const checkItemQuery = `
                SELECT id FROM shop_items
                WHERE guild_id = ? AND name = ?
            `;
            const [item] = await Database.query(checkItemQuery, [guildId, itemName]);

            if (!item) {
                return interaction.reply({
                    content: `❌ No item named **${itemName}** was found in the shop.`,
                    ephemeral: true,
                });
            }

            // Delete the item from the shop_items table
            const deleteItemQuery = `
                DELETE FROM shop_items
                WHERE guild_id = ? AND name = ?
            `;
            await Database.query(deleteItemQuery, [guildId, itemName]);

            return interaction.reply({
                content: `✅ Successfully removed **${itemName}** from the shop.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error removing shop item:', error);

            return interaction.reply({
                content: '❌ An error occurred while removing the item from the shop. Please try again later.',
                ephemeral: true,
            });
        }
    },
};