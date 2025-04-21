const { SlashCommandBuilder } = require('discord.js');
const Database = require('../../../api/constants/sql.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addshopitem')
        .setDescription('Add an item to the server shop.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the item.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('A description of the item.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('price')
                .setDescription('The price of the item in credits.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of the item (cosmetic or other).')
                .setRequired(true)
                .addChoices(
                    { name: 'Cosmetic', value: 'cosmetic' },
                    { name: 'Chunk Claim', value: 'chunk_claim' }
                )
        )
        .addStringOption(option =>
            option.setName('background_url')
                .setDescription('The background image URL for the cosmetic (optional).')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('effect_value')
                .setDescription('The effect value of the item (optional).')
                .setRequired(false)
        ),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const price = interaction.options.getInteger('price');
        const type = interaction.options.getString('type');
        const backgroundUrl = interaction.options.getString('background_url') || null;
        const effectValue = interaction.options.getString('effect_value') || null;

        try {
            // Insert the item into the shop_items table
            const insertShopItemQuery = `
                INSERT INTO shop_items (guild_id, name, description, price, type, effect_value)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await Database.query(insertShopItemQuery, [interaction.guildId, name, description, price, type, effectValue]);

            // If the item is a cosmetic, insert it into the cosmetics table
            if (type === 'cosmetic') {
                const insertCosmeticQuery = `
                    INSERT INTO cosmetics (name, description, background_url, effect_value)
                    VALUES (?, ?, ?, ?)
                `;
                await Database.query(insertCosmeticQuery, [name, description, backgroundUrl, effectValue]);
            }

            return interaction.reply({
                content: `✅ Successfully added **${name}** to the shop!`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error adding shop item:', error);

            return interaction.reply({
                content: '❌ An error occurred while adding the item to the shop. Please try again later.',
                ephemeral: true,
            });
        }
    },
};