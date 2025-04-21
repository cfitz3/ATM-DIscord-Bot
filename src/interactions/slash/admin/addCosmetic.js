const { SlashCommandBuilder } = require('discord.js');
const Database = require('../../../api/constants/sql.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcosmetic')
        .setDescription('Add a new cosmetic to the cosmetics table.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the cosmetic.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('A description of the cosmetic.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('effect_value')
                .setDescription('The effect or unique identifier for the cosmetic (optional).')
                .setRequired(false)
        ),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const effectValue = interaction.options.getString('effect_value') || null; // Optional

        try {
            // Insert the cosmetic into the cosmetics table
            const query = `
                INSERT INTO cosmetics (name, description, effect_value)
                VALUES (?, ?, ?)
            `;
            await Database.query(query, [name, description, effectValue]);

            return interaction.reply({
                content: `✅ Successfully added the cosmetic **${name}**!`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error adding cosmetic:', error);

            return interaction.reply({
                content: '❌ An error occurred while adding the cosmetic. Please try again later.',
                ephemeral: true,
            });
        }
    },
};