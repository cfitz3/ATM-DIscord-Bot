const { Events, MessageFlags, TextDisplayBuilder, ContainerBuilder } = require("discord.js");
const { getUserCredits, deductUserCredits, getMinecraftUsername } = require('../api/functions/credits.js');
const { sendConsoleCommand } = require('../api/constants/pterodactyl.js');
const Database = require('../api/constants/sql.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isStringSelectMenu()) {
            const customId = interaction.customId;

            if (customId === 'shop_menu') {
                const selectedItemId = interaction.values[0];
                const serverName = 'atm10'; 

                try {
                    // Defer the reply to avoid multiple replies
                    await interaction.deferReply({ ephemeral: true });

                    // Fetch the selected item from the database
                    const itemQuery = `
                        SELECT id, name, price, type, effect_value
                        FROM shop_items
                        WHERE id = ?
                    `;
                    const [selectedItem] = await Database.query(itemQuery, [selectedItemId]);

                    if (!selectedItem) {
                        return interaction.editReply({
                            content: '❌ The selected item is no longer available.',
                        });
                    }

                    const { name: purchasedItem, price: deductBy, type, effect_value: effectValue } = selectedItem;

                    // Get the user's current credits
                    const userCredits = await getUserCredits(interaction.user.id);

                    // Check if the user has enough credits
                    if (userCredits < deductBy) {
                        return interaction.editReply({
                            content: `❌ You don't have enough credits to purchase this item. You need ${deductBy - userCredits} more credits.`,
                        });
                    }

                    // Handle item types dynamically
                    if (type === 'chunk_claim') {
                        // Check if the user has already purchased this item
                        const checkPurchaseQuery = `
                            SELECT COUNT(*) AS purchaseCount
                            FROM purchases
                            WHERE discord_id = ? AND item_name = ?
                        `;
                        const [purchaseRecord] = await Database.query(checkPurchaseQuery, [interaction.user.id, purchasedItem]);

                        if (purchaseRecord.purchaseCount > 0) {
                            return interaction.editReply({
                                content: `❌ You have already purchased the item **${purchasedItem}**. You cannot purchase it again.`,
                            });
                        }

                        // Deduct credits and log the purchase
                        await deductUserCredits(interaction.user.id, deductBy, true, purchasedItem);

                        // Get the user's Minecraft username
                        const minecraftUsername = await getMinecraftUsername(interaction.user.id);

                        // Construct the dynamic command
                        const command = effectValue.replace('{minecraftUsername}', minecraftUsername);

                        // Send the command to the server
                        await sendConsoleCommand(serverName, command);

                        // Log the purchase in the database
                        const logPurchaseQuery = `
                            INSERT INTO purchases (discord_id, item_name, purchase_date)
                            VALUES (?, ?, NOW())
                        `;
                        await Database.query(logPurchaseQuery, [interaction.user.id, purchasedItem]);

                        return interaction.editReply({
                            content: `✅ Your purchase of **${purchasedItem}** has been successful!`,
                        });
                    } else if (type === 'cosmetic') {
                        // Handle cosmetic purchases (e.g., add to user inventory)
                        const addCosmeticQuery = `
                            INSERT INTO user_cosmetics (discord_id, cosmetic_id, equipped)
                            VALUES (?, ?, FALSE)
                            ON DUPLICATE KEY UPDATE equipped = FALSE
                        `;
                        await Database.query(addCosmeticQuery, [interaction.user.id, selectedItem.id]);

                        return interaction.editReply({
                            content: `✅ You successfully purchased the cosmetic item **${purchasedItem}**!`,
                        });
                    } else {
                        return interaction.editReply({
                            content: `❌ Unknown item type: ${type}. Please contact support.`,
                        });
                    }
                } catch (error) {
                    console.error('Error processing purchase:', error);

                    // Reply with an error message
                    await interaction.editReply({
                        content: '❌ An error occurred while processing your request. Please try again later.',
                    });
                }
            } else if (customId === 'equip_cosmetic') {
                const selectedCosmeticId = interaction.values[0];

                const unequipQuery = `
                    UPDATE user_cosmetics
                    SET equipped = FALSE
                    WHERE discord_id = ?
                `;

                const equipQuery = `
                    UPDATE user_cosmetics
                    SET equipped = TRUE
                    WHERE discord_id = ? AND cosmetic_id = ?
                `;

                try {
                    // Defer the reply to avoid multiple replies
                    await interaction.deferReply({ ephemeral: true });

                    // Unequip all cosmetics for the user
                    await Database.query(unequipQuery, [interaction.user.id]);

                    // Equip the selected cosmetic
                    await Database.query(equipQuery, [interaction.user.id, selectedCosmeticId]);

                    return interaction.editReply({
                        content: `✅ You successfully equipped the cosmetic item!`,
                    });
                } catch (error) {
                    console.error('Error equipping cosmetic:', error);

                    return interaction.editReply({
                        content: '❌ An error occurred while equipping the cosmetic. Please try again later.',
                    });
                }
            } else if (customId === 'server-info-select') {
                    const selectedServer = interaction.values[0];

                    // Custom info for each server
                    const serverInfo = {
                        server1: {
                            name: 'All The Mods 10',
                            color: 0x4caf50,
                            steps: [
                                '📝 **1. Install the Modpack** [CurseForge Download](https://www.curseforge.com/minecraft/modpacks/all-the-mods-10)',
                                '📦 **2. Download Additional Mods** [Simple Voice Chat](https://modrinth.com/plugin/simple-voice-chat/version/neoforge-1.21.1-2.5.28)',
                                '🌐 **3. Join the Server using the IP** `play.allthemodiumcraft.com`',
                            ],
                            support: 'Need help? Check out the #faq or ask in #general.'
                        },
                        server2: {
                            name: 'Yet Another Vanilla+ Pack',
                            color: 0x2196f3,
                            steps: [
                                '📝 **1. Install the Modpack** [Curseforge Download](https://www.curseforge.com/minecraft/modpacks/withers-pack)',
                                '📦 **2. Download Additional Mods** [Mod List](https://www.curseforge.com/minecraft/modpacks/withers-pack/files/123456789)',
                                '🌐 **3. Join the Server using the IP** `wp.allthemodiumcraft.com`',
                            ],
                            support: 'Need help? Check out the #faq or ask in #general.'
                        }
                    };

                    const info = serverInfo[selectedServer];
                if (!info) {
                    return interaction.reply({
                        content: '❌ Server info not found.',
                        flags: MessageFlags.Ephemeral
                    });
                }

                // Build the text content as a string (Markdown for styling)
                const textContent = [
                    `**${info.name} — Getting Started**\n`,
                    ...info.steps.map(step => {
                        const match = step.match(/^(.*?)(\[(.*?)\]\((.*?)\)|`(.*?)`)?$/);
                        if (match) {
                            const main = match[1].trim();
                            const link = match[3] && match[4] ? `[${match[3]}](${match[4]})` : '';
                            const code = match[5] ? `\`${match[5]}\`` : '';
                            let value = main;
                            if (link) value += `\n> ${link}`;
                            if (code) value += `\n> ${code}`;
                            return value;
                        }
                        return step;
                    }),
                    `> ${info.support}`
                ].join('\n\n');

                // Create the text display component
                const textDisplay = new TextDisplayBuilder().setContent(textContent);

                // Place the text display inside a container
                const container = new ContainerBuilder().addTextDisplayComponents(textDisplay);

                // Send the container as a v2 component message
                return interaction.reply({
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    components: [container]
                });
                }
            }
        }
    }