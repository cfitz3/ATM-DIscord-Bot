const { SlashCommandBuilder } = require('discord.js');
const { getLastConsoleOutput } = require('../../../api/constants/pterodactyl.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Prints the latest console output from the server'),

    async execute(interaction) {
        // Acknowledge the interaction
        await interaction.deferReply();

        // Get the last 10 lines of console output
        const output = getLastConsoleOutput();

        // Send the console output as a reply
        await interaction.editReply(`Console output:\n${output}`);
    }
};