const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { getUserCredits, getMinecraftUsername } = require('../../../api/functions/credits.js');
const { isLinked } = require('../../../api/functions/credits.js');
const { promptAccountLink } = require('../../../responses/embeds/linkPrompt.js');
const { oopsie } = require('../../../utils/errorHandler.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Spend your credits.'),

    async execute(interaction) {
        try {
          const linked = await isLinked(interaction.user.id);
          if (!linked) {
          await promptAccountLink(interaction);
            return;
          }
        } catch (err) {
            await oopsie(interaction, err);
            return;
        }

    
    const userCredits = await getUserCredits(interaction.user.id);
    const minecraft_username = await getMinecraftUsername(interaction.user.id);

    const shopEmbed = new EmbedBuilder()
    .setTitle('🛒 Credits Shop')
    .setDescription(`Hey ${minecraft_username}! ✨\n\nWelcome to the **Credits Shop**! Browse the items below and use the dropdown menu to make your purchase. Happy shopping!`)
    .setColor(0x00c3ff)
    .addFields(
        { name: '💰 75 Total Chunk Claims', value: '50 credits', inline: false },
        { name: '💰 100 Total Chunk Claims', value: '75 credits', inline: false },
        { name: '💰 150 Total Chunk Claims', value: '100 credits', inline: false }
    )

    .setFooter({ text: `You have ${userCredits} credits left • Spend them wisely! 🪙` })



        // Create the dropdown menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('shop_menu')
            .setPlaceholder('Select an item to purchase...')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Buy 75 Max Chunk Claims')
                    .setDescription('Purchase 75 Max Chunk Claims for 50 credits')
                    .setValue('item_1')
                    .setEmoji('🛒'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Buy 100 Max Chunk Claims')
                    .setDescription('Purchase 100 Max Chunk Claims for 75 credits')
                    .setValue('item_2')
                    .setEmoji('🛒'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Buy 150 Max Chunk Claims')
                    .setDescription('Purchase 150 Max Chunk Claims for 100 credits')
                    .setValue('item_3')
                    .setEmoji('🛒')
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // Send the embed with the dropdown menu
        await interaction.reply({ embeds: [shopEmbed], components: [row] });
    }
}

