const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function promptAccountLink(user) {
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

    // Return the embed and components
    return { embeds: [embed], components: [row] };
}

module.exports = { promptAccountLink };