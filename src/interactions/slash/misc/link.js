const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUUID } = require('../../../api/constants/mowojangAPI.js');
const { linkAccount } = require('../../../api/functions/credits.js'); // Import the linkAccount function

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Minecraft account to your Discord account.')
        .addStringOption(option =>
            option.setName('minecraft_username')
                .setDescription('Your Minecraft username.')
                .setRequired(true)),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const minecraft_username = interaction.options.getString('minecraft_username');

            // Fetch the Minecraft UUID
            const minecraft_uuid = await getUUID(minecraft_username);

            if (!minecraft_uuid) {
                return interaction.editReply({
                    content: '❌ This Minecraft account does not exist. Please double-check your username and try again.',
                });
            }

            // Use the linkAccount function to insert or update the user's data
            await linkAccount(interaction.user.id, interaction.user.tag, minecraft_username, minecraft_uuid);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Account Linked Successfully!')
                .setDescription(`Your Minecraft account **${minecraft_username}** has been linked to your Discord account.`)
                .setTimestamp();

            // Reply with the success message
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error linking account:', error);
            // Reply with an error message if something goes wrong
            await interaction.editReply({
                content: '❌ An error occurred while linking your account. Please try again later.',
            });
        }
    },
};