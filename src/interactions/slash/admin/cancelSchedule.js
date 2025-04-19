const { SlashCommandBuilder } = require('@discordjs/builders');
const { scheduledTasks, cancelScheduledTask } = require('../../../utils/scheduler.js');
const Database = require('../../../api/constants/sql.js'); // Adjust the path to your database module


module.exports = {
    data: new SlashCommandBuilder()
        .setName('cancelscheduledmessage')
        .setDescription('Cancels a scheduled message.')
        .addStringOption(option =>
            option
                .setName('task_id')
                .setDescription('The ID of the task to cancel.')
                .setRequired(true)
        ),

        ownerOnly: true,   

    async execute(interaction) {
        const taskId = interaction.options.getString('task_id');

        // Cancel the task
        cancelScheduledTask(taskId);

        // Remove the task from the database
        try {
            const deleteQuery = `DELETE FROM scheduled_tasks WHERE task_id = ?`;
            await Database.query(deleteQuery, [taskId]);

            return interaction.reply({
                content: `✅ Scheduled task with ID ${taskId} has been canceled.`,
                ephemeral: true,
            });
        } catch (err) {
            console.error('Error canceling scheduled task:', err);

            return interaction.reply({
                content: '❌ An error occurred while canceling the scheduled task. Please try again later.',
                ephemeral: true,
            });
        }
    },
};