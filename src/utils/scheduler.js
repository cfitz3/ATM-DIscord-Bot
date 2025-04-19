const cron = require('node-cron');
const Database = require('../api/constants/sql.js');
const { oopsie } = require('../utils/errorHandler.js');
const scheduledTasks = new Map();
const { v4: uuidv4 } = require('uuid'); 


/**
 * Schedules a task to send a message at regular intervals and stores it in the database.
 * @param {string} channelId - The ID of the channel where the message will be sent.
 * @param {string} cronExpression - The cron expression defining the schedule (e.g., '0 * * * *' for every hour).
 * @param {string} messageContent - The message content to send.
 * @param {object} client - The Discord client instance.
 */

async function scheduleTask(channelId, cronExpression, messageContent, client) {
    if (!cron.validate(cronExpression)) {
        throw new Error('Invalid cron expression');
    }

    // Generate a unique task ID
    const taskId = uuidv4();

    // Save the task to the database
    const insertQuery = `
        INSERT INTO scheduled_tasks (task_id, channel_id, cron_expression, message)
        VALUES (?, ?, ?, ?)
    `;
    await Database.query(insertQuery, [taskId, channelId, cronExpression, messageContent]);

    // Schedule the new task
    const task = cron.schedule(cronExpression, async () => {
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel && channel.isTextBased()) {
                await channel.send(messageContent);
            }
        } catch (err) {
            console.error(`Error sending scheduled message to channel ${channelId}:`, err);
        }
    });

    // Store the task in memory with metadata
    scheduledTasks.set(taskId, {
        task,
        channelId,
        cronExpression,
        messageContent,
    });

    console.log(`Task scheduled with ID ${taskId} for channel ${channelId} with cron expression: ${cronExpression}`);
    return taskId; // Return the task ID for reference
}

/**

Reloads all scheduled tasks from the database and schedules them.

@param {object} client - The Discord client instance.
*/

async function reloadScheduledTasks(client) {
    console.log('Reloading scheduled tasks from the database...');

    try {
        const tasks = await Database.query(`SELECT task_id, channel_id, cron_expression, message FROM scheduled_tasks`);
        if (!tasks.length) return console.log('No scheduled tasks found.');

        // Clear existing tasks
        scheduledTasks.forEach(({ task }) => task.stop());
        scheduledTasks.clear();
        console.log('Cleared existing tasks.');

        tasks.forEach(({ task_id, channel_id, cron_expression, message }) => {
            if (!cron.validate(cron_expression)) {
                return console.error(`Invalid cron expression for task ${task_id}: ${cron_expression}`);
            }

            const task = cron.schedule(cron_expression, async () => {
                try {
                    const channel = await client.channels.fetch(channel_id);
                    if (!channel?.isTextBased()) throw new Error(`Channel ${channel_id} not found or not text-based.`);

                    const payload = parseMessagePayload(message);
                    await channel.send(payload);
                } catch (err) {
                    handleTaskError(err, task_id, channel_id);
                }
            });

            scheduledTasks.set(task_id, { task, channelId: channel_id, cronExpression: cron_expression, messageContent: message });
        });

        console.log(`Reloaded and scheduled ${scheduledTasks.size} tasks.`);
    } catch (err) {
        console.error('Error reloading tasks:', err);
    }
}

function parseMessagePayload(message) {
    try {
        const data = JSON.parse(message);

        // Check if the parsed data is an object and contains valid Discord message properties
        if (data && typeof data === 'object') {
            const payload = {};

            // Include `content` if it exists
            if (typeof data.content === 'string') {
                payload.content = data.content;
            }

            // Include `embeds` if it exists and is an array
            if (Array.isArray(data.embeds)) {
                payload.embeds = data.embeds;
            }

            // Include `components` if it exists and is an array
            if (Array.isArray(data.components)) {
                payload.components = data.components;
            }

            // Include other properties if needed (e.g., `tts`, `attachments`)
            if (typeof data.tts === 'boolean') {
                payload.tts = data.tts;
            }

            return payload;
        }
    } catch (err) {
        console.error('Error parsing message payload:', err);
    }

    // Fallback to sending the message as plain text if parsing fails
    return { content: message };
}

function handleTaskError(err, taskId, channelId) {
    if (err.code === 10003) {
        console.error(`Task ${taskId}: Channel ${channelId} not found.`);
    } else if (err.code === 50013) {
        console.error(`Task ${taskId}: Missing permissions for channel ${channelId}.`);
    } else {
        console.error(`Task ${taskId}: Error processing task for channel ${channelId}:`, err);
    }
}


/**
 * Stops and removes a scheduled task.
 * @param {string} channelId - The ID of the channel where the task is scheduled.
 */
function cancelScheduledTask(taskId) {
    const taskData = scheduledTasks.get(taskId);
    if (taskData && taskData.task) {
        taskData.task.stop(); // Access the `task` property
        scheduledTasks.delete(taskId);
        console.log(`Canceled scheduled task with ID ${taskId}`);
    } else {
        console.log(`No scheduled task found with ID ${taskId}`);
    }
}

module.exports = { scheduledTasks, scheduleTask, reloadScheduledTasks, cancelScheduledTask };