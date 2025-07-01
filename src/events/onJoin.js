const { EmbedBuilder } = require('discord.js');
const Database = require('../api/constants/sql.js');

const welcomeEmbed = (member) => {
    return new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle(`:wave: Welcome to the server!`)
        .setAuthor({ name: 'ATM Discord Bot', iconURL: 'https://i.imgur.com/tAeDMlM.png' })
        .setDescription('Want to check out our servers? Head over to <#1329875758990229504> or <#1341171310687948861> for all the information!')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: 'Need Help? Find out more in #support! | by @withercloak' });
};

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        try {
            // Query the database for the welcome channel ID for this guild
            const [result] = await Database.query(
                'SELECT welcome_channel_id FROM guild_settings WHERE guild_id = ? LIMIT 1',
                [member.guild.id]
            );
            const welcomeChannelId = result?.welcome_channel_id;
            if (!welcomeChannelId) {
                console.error(`No welcome channel set for guild ${member.guild.id}`);
                return;
            }
            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
            if (!welcomeChannel) {
                console.error(`Channel with ID ${welcomeChannelId} not found`);
                return;
            }
            welcomeChannel.send({ content: `Welcome <@${member.id}>!`, embeds: [welcomeEmbed(member)] });
        } catch (error) {
            console.error(`Error in guildMemberAdd: ${error.message}`);
        }
    }
};