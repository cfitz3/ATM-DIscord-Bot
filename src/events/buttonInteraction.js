const { Events } = require('discord.js');
const { incrementUserCredit } = require('../api/functions/credits.js');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

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
    
    } else if(interaction.customId === 'manualGuildRefreshButton'){
      await refreshGuildData(interaction);
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