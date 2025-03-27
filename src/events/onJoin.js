
const { EmbedBuilder } = require('discord.js');

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
      console.log('guildMemberAdd event fired');  

 try {
              const welcomeChannelId = '1321494302198726710'; 
        const welcomeChannel = await member.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) {
            console.error(`Channel with ID ${welcomeChannelId} not found`);
            return;
        }
            welcomeChannel.send({ content: `Welcome <@${member.id}>!`, embeds: [welcomeEmbed(member)] });
        } catch (error) {
            console.error(`Error in guildMemberAdd: ${error.message}`);
        }
    }
}
