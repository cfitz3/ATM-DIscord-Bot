const { SlashCommandBuilder } = require('@discordjs/builders');
const { scheduleTask } = require('../../../utils/scheduler');
const { PermissionsBitField } = require('discord.js');

// Predefined intervals and their corresponding cron expressions
const intervals = {
    'Every minute': '* * * * *',
    'Every 5 minutes': '*/5 * * * *',
    'Every 10 minutes': '*/10 * * * *',
    'Every hour': '0 * * * *',
    'Every day at midnight': '0 0 * * *',
    'Every Monday at 9 AM': '0 9 * * 1',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('schedulemessage')
        .setDescription('Schedules a message to be sent at regular intervals.')
        .addStringOption(option =>
            option
                .setName('interval')
                .setDescription('Select the interval for the message.')
                .setRequired(true)
                .addChoices(
                    { name: 'Every minute', value: 'Every minute' },
                    { name: 'Every 5 minutes', value: 'Every 5 minutes' },
                    { name: 'Every 10 minutes', value: 'Every 10 minutes' },
                    { name: 'Every hour', value: 'Every hour' },
                    { name: 'Every day at midnight', value: 'Every day at midnight' },
                    { name: 'Every Monday at 9 AM', value: 'Every Monday at 9 AM' },
                )
        )
        .addStringOption(option =>
            option
                .setName('channel')
                .setDescription('The ID of the channel where the message will be sent.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message content to send.')
                .setRequired(true)
        ),

    adminOnly: true,

    async execute(interaction) {
        // Check if the user has admin permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true,
            });
        }

        // Get inputs from the slash command
        const interval = interaction.options.getString('interval');
        const channelId = interaction.options.getString('channel');
        const messageContent = interaction.options.getString('message');

        // Map the selected interval to its corresponding cron expression
        const cronExpression = intervals[interval];

        try {
            // Schedule the task using the SQL-based scheduler
            await scheduleTask(channelId, cronExpression, messageContent, interaction.client);

            // Reply to the user
            return interaction.reply({
                content: `✅ Message scheduled successfully! It will be sent to <#${channelId}> with the following interval: \`${interval}\`.`,
                ephemeral: true,
            });
        } catch (err) {
            console.error('Error scheduling message:', err);

            // Reply with an error message
            return interaction.reply({
                content: '❌ An error occurred while scheduling the message. Please try again later.',
                ephemeral: true,
            });
        }
    },
};