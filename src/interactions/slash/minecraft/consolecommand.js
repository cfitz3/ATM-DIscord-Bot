/* const { SlashCommandBuilder } = require('discord.js');
const { sendConsoleCommand, getLastConsoleOutput } = require('../../../api/constants/pterodactyl.js');
const { EmbedBuilder } = require('discord.js');

// Function to extract data from the log string
function extractData(logString) {
    const tpsMatch = logString.match(/TPS from last[\s\S]*?\[⚡\]\s+([\d*., ]+)/);
    const tickMatch = logString.match(/Tick durations[\s\S]*?\[⚡\]\s+([\d./; ]+)/);
    const cpuMatch = logString.match(/CPU usage[\s\S]*?\[⚡\]\s+([\d%, ]+\(system\))[\s\S]*?\[⚡\]\s+([\d%, ]+\(process\))/);
  
    return {
      tps: tpsMatch ? tpsMatch[1].trim() : 'N/A',
      tickDurations: tickMatch ? tickMatch[1].trim() : 'N/A',
      cpuSystem: cpuMatch ? cpuMatch[1].trim() : 'N/A',
      cpuProcess: cpuMatch ? cpuMatch[2].trim() : 'N/A'
    };
  }

// Create and send the embed
async function sendPerformanceEmbed(interaction, logData) {
  const data = extractData(logData);

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Server Performance Metrics')
    .addFields(
      { name: 'TPS (last 5s, 10s, 1m, 5m, 15m)', value: data.tps },
      { name: 'Tick Durations (min/med/95%ile/max ms)', value: data.tickDurations },
      { name: 'CPU Usage', value: `System: ${data.cpuSystem}\nProcess: ${data.cpuProcess}` }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('command')
        .setDescription('Sends a command to the server')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of command to send')
                .setRequired(true)
                .addChoices(
                    { name: 'spark tps', value: 'spark_tps' },
                    { name: 'say', value: 'say' },
                    { name: 'observable run', value: 'observable_run' },
                    { name: 'spark healthreport', value: 'spark_healthreport' }
                ))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message content for the command')
                .setRequired(false)),

    async execute(interaction) {
        // Acknowledge the interaction
        await interaction.deferReply();

        // Get the command options from the user
        const type = interaction.options.getString('type');
        const message = interaction.options.getString('message') || '';

        // Determine the command to send based on the type
        let command;
        switch (type) {
            case 'spark_tps':
                command = 'spark tps';
                break;
            case 'say':
                command = `say ${message}`;
                break;
            case 'observable_run':
                command = `observable run ${message}`;
                break;
            case 'spark_healthreport':
                command = 'spark healthreport';
                break;
            default:
                await interaction.editReply('Invalid command type.');
                return;
        }

        // Send the command to the server
        sendConsoleCommand(command);

        // Handle specific commands that require console output
        if (type === 'spark_healthreport' || type === 'spark_tps') {
            // Wait for a short period to get the console response
            setTimeout(async () => {
                const output = getLastConsoleOutput();
                await sendPerformanceEmbed(interaction, output);
            }, 2000); // Adjust the delay as needed
        } else {
            // Send a confirmation reply
            await interaction.editReply(`Command sent: ${command}`);
        }
    }
};
*/