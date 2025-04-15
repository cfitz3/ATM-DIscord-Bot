const { SlashCommandBuilder } = require('discord.js');
const { sendConsoleCommand } = require('../../../api/constants/pterodactyl.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a console command to the Minecraft server')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The console command to send')
                .setRequired(true)
        ),

    async execute(interaction) {
        // Get the command input from the user
        const command = interaction.options.getString('command');

        // Acknowledge the interaction
        await interaction.deferReply();

        try {
            // Send the console command
            await sendConsoleCommand(command);

            // Reply with a success message
            await interaction.editReply(`Command "${command}" sent successfully.`);
        } catch (error) {
            console.error('Error sending console command:', error);

            // Reply with an error message
            await interaction.editReply('Failed to send the console command. Please try again.');
        }
    },
};