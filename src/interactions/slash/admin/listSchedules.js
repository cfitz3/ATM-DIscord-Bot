const { SlashCommandBuilder } = require('@discordjs/builders');
const { scheduledTasks } = require('../../../utils/scheduler.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('listscheduledtasks')
        .setDescription('Displays a list of all currently scheduled tasks.'),

    async execute(interaction) {
        if (scheduledTasks.size === 0) {
            return interaction.reply({
                content: '❌ No scheduled tasks are currently running.',
                ephemeral: true,
            });
        }

        const taskList = Array.from(scheduledTasks.entries())
            .map(([taskId, task]) => `- Task ID: \`${taskId}\``)
            .join('\n');

        return interaction.reply({
            content: `✅ **Currently Scheduled Tasks:**\n${taskList}`,
            ephemeral: true,
        });
    },
};