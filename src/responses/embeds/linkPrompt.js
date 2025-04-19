const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { isLinked } = require('../../api/functions/credits.js'); 

async function promptAccountLink(interaction) {
    // Check if the user's account is already linked
    const linked = await isLinked(interaction.user.id);

    if (!linked) {
        // Create an embed to prompt the user
        const embed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle('Link Your Minecraft Account')
            .setDescription(
                'Link your Minecraft account to your Discord account to unlock rewards and features! ' +
                'Click the button below to link your account and receive **50 bonus credits**.'
            )
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('link_account')
                .setLabel('Link Account')
                .setStyle(ButtonStyle.Primary)
        );
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
}

module.exports = { promptAccountLink };