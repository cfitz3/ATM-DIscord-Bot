const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserCredits, isLinked } = require('../../../api/functions/credits.js');
const { promptAccountLink } = require('../../../responses/embeds/linkPrompt.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your current credit balance.'),

  async execute(interaction) {
    try {
      const linked = await isLinked(interaction.user.id);
      if (!linked) {
      await promptAccountLink(interaction);
        return;
      }

      const credits = await getUserCredits(interaction.user.id);

      // Add flair: color, thumbnail, emoji, and a fun footer
      const creditEmbed = new EmbedBuilder()
        .setColor(0x00c3ff)
        .setTitle('💰 Credit Balance')
        .setDescription(`Hey ${interaction.user.username}, here’s your current balance:`)
        .addFields(
          { name: 'Server Credits', value: `**${credits}** 🪙`, inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ 
          text: 'Earn more credits by voting for our servers!'})
        .setTimestamp();

      await interaction.reply({ embeds: [creditEmbed], ephemeral: true });
    } catch (error) {
      console.error('Failed to fetch user credits:', error);
      await interaction.reply({ 
        content: '❌ There was an error fetching your credit balance. Please try again later.', 
        ephemeral: true 
      });
    }
  }
};
