const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
    .setColor(0xFF69B4)
    .setTitle('Voting Sites')
    .setAuthor({ name: 'ATM Guild Bot', iconURL: 'https://i.imgur.com/eboO5Do.png' })
    .setDescription('Our servers are and always will be free to play. Please consider voting for us on the following sites. Voting helps us grow and attract new players to the community!')
    .addFields(
        { name: 'Craft to Exile 2:', value: '[MCSL](https://minecraft-server-list.com/server/510426/)', inline: true }
    )
    .addFields(
        { name: 'All the Mods 10:', value: '[MCSL](https://minecraft-server-list.com/server/510233/)', inline: true }
    )
    .setTimestamp();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for our servers!'),

    async execute(interaction) {
        try {
            // Reply with the embed
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error displaying vote embed:', error);
            // Reply with an error message if something goes wrong
            await interaction.reply({
                content: '❌ An error occurred while displaying the voting sites. Please try again later.',
                ephemeral: true,
            });
        }
    },
};