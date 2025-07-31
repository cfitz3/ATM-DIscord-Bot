const { Events, MessageFlags, TextDisplayBuilder, ContainerBuilder, MediaGalleryBuilder, } = require('discord.js');
const { linkAccount } = require('../api/functions/credits.js');
const { getUUID } = require('../api/constants/mowojangAPI.js');
const Database = require('../api/constants/sql.js'); 
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid'); 

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        try {
            if (interaction.customId === 'link_modal') {
                // Get the Minecraft username from the modal input
                const minecraftUsername = interaction.fields.getTextInputValue('minecraft_username');

                try {
                    // Fetch the Minecraft UUID
                    const minecraftUuid = await getUUID(minecraftUsername);

                    if (!minecraftUuid) {
                        // If the UUID is null, reply with an error message
                        await interaction.reply({
                            content: '❌ The Minecraft username you entered is invalid. Please double-check and try again.',
                            ephemeral: true,
                        });
                        return;
                    }

                    // Call the function to handle the linking logic
                    await linkAccount(interaction.user.id, interaction.user.tag, minecraftUsername, minecraftUuid);

                    // Reply with a success message
                    await interaction.reply({
                        content: `✅ Your Minecraft account **${minecraftUsername}** has been successfully linked!`,
                        ephemeral: true,
                    });
                } catch (error) {
                    console.error('Error handling link_modal submission:', error);

                    // Reply with an error message
                    await interaction.reply({
                        content: '❌ An error occurred while linking your account. Please try again later.',
                        ephemeral: true,
                    });
                }
            } else if (interaction.customId === 'load_task_modal') {
                try {
                    // Retrieve the embed JSON and cron expression from the modal inputs
                    const embedJsonInput = interaction.fields.getTextInputValue('embed_json');
                    const cronExpression = interaction.fields.getTextInputValue('cron_expression');

                    // Validate the cron expression
                    if (!cron.validate(cronExpression)) {
                        return interaction.reply({
                            content: '❌ The provided cron expression is invalid. Please try again with a valid expression.',
                            ephemeral: true,
                        });
                    }

                    // Parse the embed JSON
                    let embedData;
                    try {
                        embedData = JSON.parse(embedJsonInput);
                    } catch (error) {
                        return interaction.reply({
                            content: '❌ The provided embed JSON is invalid. Please ensure it is properly formatted.',
                            ephemeral: true,
                        });
                    }

                    // Generate a unique task ID using uuidv4
                    const taskId = uuidv4();
                    const channelId = interaction.channel.id;

                    console.log('Embed Data:', embedData);

                    // Save the task to the database
                    const query = `
                        INSERT INTO scheduled_tasks (task_id, channel_id, cron_expression, message)
                        VALUES (?, ?, ?, ?)
                    `;
                    await Database.query(query, [taskId, channelId, cronExpression, JSON.stringify(embedData)]);

                    // Reply to the user
                    await interaction.reply({
                        content: `✅ Embed scheduled successfully with Task ID: \`${taskId}\`.`,
                        ephemeral: true,
                    });
                } catch (error) {
                    console.error('Error handling load_task_modal submission:', error);

                    // Reply with an error message
                    await interaction.reply({
                        content: '❌ An error occurred while saving the embed. Please try again later.',
                        ephemeral: true,
                    });
                }
            }  else if (interaction.customId === 'containerCreateModal') {
                // --- Server Menu Modal Handler ---
                const menuTitle = interaction.fields.getTextInputValue('menuTitle');
                const menuDescription = interaction.fields.getTextInputValue('menuDescription');
                const inputField1 = interaction.fields.getTextInputValue('inputField1') || '';
                const inputField2 = interaction.fields.getTextInputValue('inputField2') || '';
                const inputField3 = interaction.fields.getTextInputValue('inputField3') || '';

                // Media gallery (static or add a field for this if you want)
                const footerImage = new MediaGalleryBuilder().addItems([
                    {
                        media: {
                            url: 'https://i.imgur.com/Y5pCOqz.png',
                        },
                    },
                ]);

                const titleAndDesc = new TextDisplayBuilder().setContent(
                    `**${menuTitle}**\n\n${menuDescription}`
                );
                const spacer = new TextDisplayBuilder().setContent('\u200b');
                const inputFields = new TextDisplayBuilder().setContent(
                    [inputField1, inputField2, inputField3].filter(Boolean).join('\n')
                );
                const support = new TextDisplayBuilder().setContent(
                    '> If you have any issues, feel free to open a ticket in #support.'
                );
                
              const infoContainer = new ContainerBuilder()
                    .addTextDisplayComponents(
                        titleAndDesc,
                        spacer,
                        inputFields,
                        support
                    )
                    .addMediaGalleryComponents(footerImage);

                await interaction.reply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [infoContainer]
                });
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            await interaction.reply({
                content: 'There was an issue processing your request. Please try again.',
                ephemeral: true,
            });
        }
    },
};


