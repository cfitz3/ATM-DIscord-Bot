const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { getUserCredits, getMinecraftUsername } = require('../../../features/credits.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('redeem')
    .setDescription('Spend your credits.'),

  async execute(interaction) {
    const userCredits = await getUserCredits(interaction.user.id);
    const minecraft_username = await getMinecraftUsername(interaction.user.id);

     const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('guild_join_menu')
                    .setPlaceholder('Select an option')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Join SBR')
                            .setValue('sbr'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Join SBR+')
                            .setValue('sbr_plus')
                    );

                    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    const storeMenu = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle('Redeem Credits')
        .setAuthor({ name: 'SBR Guild Bot', iconURL: 'https://i.imgur.com/eboO5Do.png' })
        .setDescription(`You have ${userCredits} credits.`)
        .addFields(
            { name: 'Redeemable Items', value: '1. Item 1\n2. Item 2\n3. Item 3', inline: true }
        )
        .setFooter({ text: `Minecraft Username: ${minecraft_username}` })
        .setTimestamp();



            await interaction.reply({ embeds: [storeMenu], components: [actionRow] });
          }
        };
