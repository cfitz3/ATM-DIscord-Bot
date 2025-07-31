const { MessageFlags, Events, TextDisplayBuilder, ContainerBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { serverMenuContainer }  = require('../messages/containers/serverMenuContainer.js');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
    if (interaction.isButton()) {
    if (interaction.customId === 'syncHelpButton') {
      await interaction.reply({ embeds: [syncHelp] });

    } else if (interaction.customId === 'linkHelpButton') {
      await interaction.reply({ embeds: [linkHelp] });

    } else if(interaction.customId === 'restartGuildButton'){
      await interaction.reply({ content: 'Restarting the bot...', ephemeral: true });
      process.exit();
    
    } else if (interaction.customId === 'sendServerMenu') {
    // Build the select menu
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('server-info-select')
        .setPlaceholder('Select a server to view info')
        .addOptions([
            { label: 'All The Mods 10', value: 'server1', emoji: '<:atm10:1387349750147186688>' },
            { label: 'Yet Another Vanilla+ Pack', value: 'server2', emoji: '🟦' },
        ]);
    const row = new ActionRowBuilder().addComponents(selectMenu);
    const container = serverMenuContainer();

    await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container, row]
    });
    }
      if (interaction.customId === 'link_account') {

      const modal = new ModalBuilder()
        .setCustomId('link_modal')
        .setTitle('Link Your Account');

      const accountIdInput = new TextInputBuilder()
        .setCustomId('minecraft_username')
        .setLabel('Enter your Minecraft username')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Your Minecraft username')
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(accountIdInput);

      modal.addComponents(actionRow);

      await interaction.showModal(modal);
      };
  }
}
}