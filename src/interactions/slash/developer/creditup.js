const { SlashCommandBuilder } = require('@discordjs/builders');
const { incrementUserCredit } = require('../../../api/functions/credits.js'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devmode')
        .setDescription('Up your current credit balance.'),

    async execute(interaction) {
 
        // Acknowledge the interaction
     
        await incrementUserCredit(interaction.user.globalName, 1000); // Adjust the amount as necessary
        await interaction.reply({ content: 'Your credit balance has been increased by 10 credits.', ephemeral: true });
    },
};
