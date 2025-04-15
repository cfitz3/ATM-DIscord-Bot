const { SlashCommandBuilder } = require('@discordjs/builders');
const { getPurchaseHistory } = require('../../../api/functions/credits.js'); // Adjust the path as necessary
module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('View your purchase history.'),

    async execute(interaction) {
        try {
            const result = await getPurchaseHistory(interaction.user.id);

            if (!result || result.length === 0) {
                await interaction.reply({ content: 'You have no purchase history.', ephemeral: true });
                return;
            }

            const formattedHistory = result
                .map((purchase, index) => `**${index + 1}.** Item: ${purchase.item_name}, Amount: ${purchase.amount}, Date: ${new Date(purchase.date).toLocaleDateString()}`)
                .join('\n');

            await interaction.reply({ content: `Your purchase history:\n${formattedHistory}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error retrieving your purchase history. Please try again later.', ephemeral: true });
        }
    },
};
