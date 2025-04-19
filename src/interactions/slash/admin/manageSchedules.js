const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const { scheduledTasks, cancelScheduledTask } = require('../../../utils/scheduler.js');
const Database = require('../../../api/constants/sql.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('manageschedules')
        .setDescription('Manage currently scheduled tasks (list, cancel, create, load).'),

    adminOnly: true,

    async execute(interaction) {
        // Create the embed for the menu
        const embed = new EmbedBuilder()
            .setTitle('Scheduled Tasks Menu')
            .setColor(0x00AE86)
            .setDescription(
                scheduledTasks.size > 0
                    ? Array.from(scheduledTasks.entries())
                          .map(([taskId, taskData]) => {
                              return `**Task ID:** \`${taskId}\`\n**Message:** ${taskData.messageContent || 'N/A'}\n**Channel:** <#${taskData.channelId || 'Unknown'}>\n**Interval:** \`${taskData.cronExpression || 'Unknown'}\``;
                          })
                          .join('\n\n')
                    : 'No scheduled tasks are currently running.'
            )
            .setFooter({ text: 'Use the buttons below to manage tasks.' });

        // Create buttons for interaction
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('cancel_task')
                .setLabel('Cancel Task')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('create_task')
                .setLabel('Create Task')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('load_task')
                .setLabel('Import Task')
                .setStyle(ButtonStyle.Secondary)
        );

        // Send the embed with buttons
        const message = await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true,
        });

        // Create a collector to handle button interactions
        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 60000, // 1 minute
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'cancel_task') {
                // Check if there are any tasks to cancel
                if (scheduledTasks.size === 0) {
                    return i.reply({
                        content: '❌ There are no tasks to cancel.',
                        ephemeral: true,
                    });
                }

                // Create a select menu with existing task IDs
                const options = Array.from(scheduledTasks.entries()).map(([taskId, taskData]) => ({
                    label: `Task ID: ${taskId}`,
                    description: `Channel: <#${taskData.channelId}> | Interval: ${taskData.cronExpression}`,
                    value: taskId,
                }));

                const selectMenu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_task_to_cancel')
                        .setPlaceholder('Select a task to cancel')
                        .addOptions(options)
                );

                // Send the select menu to the user
                await i.reply({
                    content: 'Please select the task you want to cancel:',
                    components: [selectMenu],
                    ephemeral: true,
                });
            }

            if (i.customId === 'select_task_to_cancel') {
                const selectedTaskId = i.values[0]; 
        
                await i.deferUpdate();
            
                cancelScheduledTask(selectedTaskId);
            
                // Optionally, delete the task from the database
                try {
                    const deleteQuery = `DELETE FROM scheduled_tasks WHERE task_id = ?`;
                    await Database.query(deleteQuery, [selectedTaskId]);
            
                    // Send a follow-up message
                    await interaction.followUp({
                        content: `✅ Task with ID \`${selectedTaskId}\` has been canceled and removed from the database.`,
                        ephemeral: true,
                    });
                } catch (err) {
                    console.error('Error deleting task from database:', err);
            
                    // Send an error follow-up message
                    await interaction.followUp({
                        content: '❌ An error occurred while removing the task from the database. Please try again later.',
                        ephemeral: true,
                    });
                }
            }

            if (i.customId === 'load_task') {
                // Show a modal to collect embed JSON and cron expression
                const modal = new ModalBuilder()
                .setCustomId('load_task_modal')
                .setTitle('Load Task Details');
            
            const embedJsonInput = new TextInputBuilder()
                .setCustomId('embed_json')
                .setLabel('Embed JSON')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Paste the embed JSON here')
                .setRequired(true);
            
            const cronInput = new TextInputBuilder()
                .setCustomId('cron_expression')
                .setLabel('Cron Expression')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 0 12 * * * (daily at 12 PM)')
                .setRequired(true);
            
            const actionRow1 = new ActionRowBuilder().addComponents(embedJsonInput);
            const actionRow2 = new ActionRowBuilder().addComponents(cronInput);
            
            modal.addComponents(actionRow1, actionRow2);
            
            await i.showModal(modal);
            }
        });

        collector.on('end', () => {
            // Disable buttons after the collector ends
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('cancel_task')
                    .setLabel('Cancel Task')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('create_task')
                    .setLabel('Create Task')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('load_task')
                    .setLabel('Load Task')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );

            message.edit({ components: [disabledRow] });
        });
    },
};