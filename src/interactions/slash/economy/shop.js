const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const Database = require('../../../api/constants/sql.js');
const { getUserCredits, getMinecraftUsername } = require('../../../api/functions/credits.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Spend your credits.'),

    linked: true,

    async execute(interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        try {
            // Fetch user credits and Minecraft username
            const userCredits = await getUserCredits(userId);
            const minecraftUsername = await getMinecraftUsername(userId);

            // Fetch shop items for the current server
            const shopItemsQuery = `
                SELECT id, name, description, price, type
                FROM shop_items
                WHERE guild_id = ?
            `;
            const shopItems = await Database.query(shopItemsQuery, [guildId]);

            if (shopItems.length === 0) {
                return interaction.reply({
                    content: '❌ No items are available in the shop for this server.',
                    ephemeral: true,
                });
            }

            // Create the shop embed
            const shopEmbed = new EmbedBuilder()
                .setTitle('🛒 Credits Shop')
                .setDescription(`Hey ${minecraftUsername}! ✨\n\nWelcome to the **Credits Shop**! Browse the items below and use the dropdown menu to make your purchase. Happy shopping!`)
                .setColor(0x00c3ff)
                .setFooter({ text: `You have ${userCredits} credits left • Spend them wisely! 🪙` });

            // Add shop items to the embed
            shopItems.forEach((item) => {
                shopEmbed.addFields({
                    name: `${item.name} - ${item.price} Credits`,
                    value: item.description,
                    inline: false,
                });
            });

            // Create the dropdown menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('shop_menu')
                .setPlaceholder('Select an item to purchase...')
                .addOptions(
                    shopItems.map((item) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(item.name)
                            .setDescription(item.description)
                            .setValue(item.id.toString())
                            .setEmoji('🛒')
                    )
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Send the embed with the dropdown menu
            await interaction.reply({ embeds: [shopEmbed], components: [row], ephemeral: true });
            
        } catch (error) {
            console.error('Error executing shop command:', error);

            if (!interaction.deferred && !interaction.replied) {
                return interaction.reply({
                    content: '❌ An error occurred while loading the shop. Please try again later.',
                    ephemeral: true,
                });
            }

            return interaction.editReply({
                content: '❌ An error occurred while loading the shop. Please try again later.',
            });
        }
    },
};
