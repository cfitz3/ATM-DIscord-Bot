const { ChannelType, PermissionsBitField, Events } = require('discord.js');

// Replace with your actual channel/category IDs
const JOIN_TO_CREATE_CHANNEL_ID = '1321494302198726711';
const TEMP_CATEGORY_ID = '1321494302198726709'; // Optional

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        // Only act if user joined the designated channel
        if (!oldState.channelId && newState.channelId === JOIN_TO_CREATE_CHANNEL_ID) {
            const guild = newState.guild;
            const member = newState.member;

            // Create a unique channel name
            const channelName = `${member.user.username}'s Channel`;

            // Create the temporary voice channel
            const tempChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildVoice,
                parent: TEMP_CATEGORY_ID, // Optional: put in a category
                permissionOverwrites: [
                    {
                        id: guild.id,
                        allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ManageChannels],
                    },
                ],
            });

            // Move the user to the new channel
            await member.voice.setChannel(tempChannel);

            // Periodically check if the channel is empty and delete it if so
            const interval = setInterval(async () => {
                const fresh = await guild.channels.fetch(tempChannel.id).catch(() => null);
                if (!fresh) return clearInterval(interval);
                if (fresh.members.size === 0) {
                    await fresh.delete().catch(() => {});
                    clearInterval(interval);
                }
            }, 10000); // Check every 10 seconds
        }
    }
};