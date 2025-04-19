/*
const { SlashCommandBuilder } = require('discord.js');
const { sendConsoleCommand } = require('../../../api/constants/pterodactyl.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Sends a message to the server')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message content for the command')
                .setRequired(true)),

    async execute(interaction) {
        // Acknowledge the interaction
        await interaction.deferReply();

        // Get the message option from the user
        const message = interaction.options.getString('message');

        // Send the command to the server
        const command = `say ${message}`;
        sendConsoleCommand(command);

        // Send a confirmation reply
        await interaction.editReply(`Command sent: ${command}`);
    }
};
*/