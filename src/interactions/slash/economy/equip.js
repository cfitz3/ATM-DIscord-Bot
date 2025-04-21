const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Database = require('../../../api/constants/sql.js');
const { linked } = require('./shop.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Equip a cosmetic item from your inventory.'),

    linked: true,

    async execute(interaction) {
        try {
            // Fetch the user's inventory
            const inventoryQuery = `
                SELECT uc.cosmetic_id, c.name
                FROM user_cosmetics uc
                JOIN cosmetics c ON uc.cosmetic_id = c.id
                WHERE uc.discord_id = ?
            `;
            const inventory = await Database.query(inventoryQuery, [interaction.user.id]);

            if (inventory.length === 0) {
                return interaction.reply({
                    content: '❌ You do not own any cosmetics to equip.',
                    ephemeral: true,
                });
            }

            // Filter out duplicate cosmetic_id values
            const uniqueInventory = inventory.filter(
                (item, index, self) =>
                    index === self.findIndex((t) => t.cosmetic_id === item.cosmetic_id)
            );

            // Create a select menu with the user's owned cosmetics
            const options = uniqueInventory.map(item => ({
                label: item.name,
                value: item.cosmetic_id.toString(),
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('equip_cosmetic')
                .setPlaceholder('Select a cosmetic to equip')
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Send the select menu to the user
            return interaction.reply({
                content: 'Select a cosmetic to equip:',
                components: [row],
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error fetching inventory:', error);

            return interaction.reply({
                content: '❌ An error occurred while fetching your inventory. Please try again later.',
                ephemeral: true,
            });
        }
    },
};