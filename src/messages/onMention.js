const { getGuildSettings } = require("../utils/getGuildSettings.js");

module.exports = {
    // @param {import('discord.js').Message} message The Message Object of the command.
    async execute(message) {
        const guildId = message.guild?.id; 
        const guildSettings = guildId ? await getGuildSettings(guildId) : null;
        const prefix = guildSettings?.prefix || "!"; 

        return message.channel.send(
            `Hi ${message.author}! My prefix is \`${prefix}\`. Get help by typing \`${prefix}help\`.`
        );
    },
};