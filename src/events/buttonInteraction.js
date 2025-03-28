const { Events } = require('discord.js');
const { syncHelp, linkHelp, forumLinks, forumOops } = require('../responses/embeds/adminEmbeds.js');
const refreshGuildData = require('../api/functions/refreshGuildMembers.js');
const { incrementUserCredit } = require('../features/credits.js');

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
      
    };
  }
}