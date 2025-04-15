const { Events } = require("discord.js");
const { getUserCredits, deductUserCredits, getMinecraftUsername, hasPurchasedItem } = require('../api/functions/credits.js');
const { sendConsoleCommand } = require('../api/constants/pterodactyl.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isStringSelectMenu() && interaction.customId === 'shop_menu') {
            const selectedOption = interaction.values[0];
            let deductBy, purchasedItem, command;

            if (selectedOption === 'item_1') {
                deductBy = 50;
                purchasedItem = '75claims';
                command = `ftbranks add {minecraftUsername} ${purchasedItem}`;
            } else if (selectedOption === 'item_2') {
                deductBy = 75;
                purchasedItem = '100claims';
                command = `ftbranks add {minecraftUsername} ${purchasedItem}`;
            } else if (selectedOption === 'item_3') {
                deductBy = 100;
                purchasedItem = '150claims';
                command = `ftbranks add {minecraftUsername} ${purchasedItem}`;
            } else {
                await interaction.reply({
                    content: 'Invalid selection.',
                    ephemeral: true,
                });
                return;
            }

            try {
                // Check if the user has already purchased this item
                const alreadyPurchased = await hasPurchasedItem(interaction.user.id, purchasedItem);
                if (alreadyPurchased) {
                    await interaction.reply({
                        content: `You have already purchased this item (${purchasedItem}). You cannot buy it again!`,
                        ephemeral: true,
                    });
                    return; // Exit the function to prevent further processing
                }

                // Get the user's current credits
                const userCredits = await getUserCredits(interaction.user.id);

                // Check if the user has enough credits
                if (userCredits >= deductBy) {
                    // Deduct credits and log the purchase
                    await deductUserCredits(interaction.user.id, deductBy, true, purchasedItem);
                    const minecraftUsername = await getMinecraftUsername(interaction.user.id);
                    await sendConsoleCommand(command.replace('{minecraftUsername}', minecraftUsername)); // Execute the command

                    // Reply with success message
                    await interaction.reply({
                        content: 'Your purchase has been successful!',
                        ephemeral: true,
                    });
                } else {
                    // Reply with insufficient credits message
                    await interaction.reply({
                        content: `You don't have enough credits to purchase this item. You need ${deductBy - userCredits} more credits.`,
                        ephemeral: true,
                    });
                }
            } catch (error) {
                console.error('Error processing purchase:', error);

                // Reply with an error message
                await interaction.reply({
                    content: 'An error occurred while processing your request. Please try again later.',
                    ephemeral: true,
                });
            }
        }
    },
};