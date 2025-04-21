const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logModAction } = require('../../../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Temporarily mute a user in the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('The duration of the timeout in minutes.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the timeout.')
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const channelId = interaction.channel.id; // Get the ID of the channel where the command was run

        // Fetch the member to timeout
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
        }

        // Check if the duration is valid
        if (duration <= 0 || duration > 43200) { // Max timeout duration is 28 days (43200 minutes)
            return interaction.reply({ content: '❌ Duration must be between 1 and 43200 minutes.', ephemeral: true });
        }

        // Apply the timeout
        const timeoutDuration = duration * 60 * 1000; // Convert minutes to milliseconds
        try {
            await member.timeout(timeoutDuration, reason);
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: '❌ Failed to timeout the user. Ensure I have the "MODERATE_MEMBERS" permission.', ephemeral: true });
        }

        // Log the moderation action
        await logModAction(
            interaction.guild,
            'Timeout',
            target,
            interaction.user,
            reason,
            channelId
        );

        // Send a confirmation message
        await interaction.reply({ content: `✅ User ${target.tag} has been timed out for ${duration} minute(s).`, ephemeral: true });
    },
};