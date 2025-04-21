const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mariaDB = require('../../../api/constants/sql.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlink your Minecraft account from your Discord account.'),
        
    ownerOnly: true, 

    async execute(interaction) {
        try {
            // Defer the reply to handle longer operations
            await interaction.deferReply({ ephemeral: true });

            // Delete the user's entry from the database
            const query = `DELETE FROM users WHERE discord_id = ?`;
            const result = await mariaDB.query(query, [interaction.user.id]);

            if (result.affectedRows > 0) {
                // Create a success embed
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Account Unlinked Successfully!')
                    .setDescription('Your Minecraft account has been unlinked from your Discord account.')
                    .setTimestamp();

                // Reply with the success message
                await interaction.editReply({ embeds: [embed] });
            } else {
                // Reply if no account was linked
                await interaction.editReply({
                    content: '❌ No linked account was found for your Discord ID.',
                });
            }
        } catch (error) {
            console.error('Error unlinking account:', error);

            // Reply with an error message
            await interaction.editReply({
                content: '❌ An error occurred while unlinking your account. Please try again later.',
            });
        }
    },
};