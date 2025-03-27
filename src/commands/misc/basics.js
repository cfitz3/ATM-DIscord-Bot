const {EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ip', // Command name (used to trigger the command)
    description: 'Server Info', // Command description (optional),
    execute(message, args) {
        const embed = new EmbedBuilder()
        .setColor(0xFF69B4)
	.setTitle('Server Info')
	.setAuthor({ name: 'ATM Guild Bot', iconURL: 'https://i.imgur.com/eboO5Do.png' })
	.setDescription('Blahblahblah')
	.addFields(
        { name: 'All the Mods 9:', value: 'play.allthemodiumcraft.com\n[Important Info](https://discord.com/channels/1321494302198726707/1329875758990229504)', inline: true }
	)
    .addFields(
        { name : 'Prominence II:', value: 'prom2.allthemodiumcraft.com\n[Important Info](https://discord.com/channels/1321494302198726707/1341171310687948861)', inline: true }
    )
	.setTimestamp()
  

        message.reply({ embeds: [embed] });},
};