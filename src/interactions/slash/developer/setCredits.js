const { SlashCommandBuilder } = require('@discordjs/builders');
const { incrementUserCredit } = require('../../../api/functions/credits.js'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcredits')
        .setDescription('Modify a user\'s credit balance.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose credits you want to modify.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of credits to add or deduct.')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('deduct')
                .setDescription('Set to true to deduct credits instead of adding.')
                .setRequired(false)),
                
    ownerOnly: true, 

    async execute(interaction) {
        // Acknowledge the interaction
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        if (amount === null || amount < 0) {
            return await interaction.reply({ content: 'Please provide a valid credit amount (non-negative integer).', ephemeral: true });
        }
        const isDeduction = interaction.options.getBoolean('deduct');
        const creditChange = isDeduction ? -amount : amount;

        await incrementUserCredit(targetUser.username, creditChange);

        await interaction.reply({ 
            content: `The credit balance of ${targetUser.username} has been ${isDeduction ? 'decreased' : 'increased'} by ${amount} credits.`, 
            ephemeral: true 
        });
    },
};
