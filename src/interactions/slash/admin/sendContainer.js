const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildServerMenuModal } = require('../../modals/category/containerCreateModal.js'); // Adjust path if needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendcontainer')
        .setDescription('Open the container creation modal')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.showModal(buildServerMenuModal());
    }
};