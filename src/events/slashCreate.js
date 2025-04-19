const { Events } = require("discord.js");
const { getGuildSettings } = require("../utils/getGuildSettings.js");
const { isLinked } = require("../api/functions/credits.js");
const { promptAccountLink } = require("../responses/embeds/linkPrompt.js"); 

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const { client } = interaction;

        if (!interaction.isChatInputCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);

        if (!command) return;

        // Fetch guild-specific settings
        const guildSettings = await getGuildSettings(interaction.guildId);

        try {
            // Check for ownerOnly
            if (command.ownerOnly) {
                const guildOwnerId = guildSettings?.owner_id || interaction.guild.ownerId;
                if (interaction.user.id !== guildOwnerId) {
                    return interaction.reply({
                        content: "❌ This command is restricted to the bot owner.",
                        ephemeral: true,
                    });
                }
            }

            // Check for adminOnly
            if (command.adminOnly) {
                const adminRoleId = guildSettings.admin_role_id;
                const member = await interaction.guild.members.fetch(interaction.user.id);

                if (!adminRoleId || !member.roles.cache.has(adminRoleId)) {
                    return interaction.reply({
                        content: "❌ This command is restricted to admins.",
                        ephemeral: true,
                    });
                }
            }

            // Check for staffOnly
            if (command.staffOnly) {
                const staffRoleId = guildSettings.staff_role_id;
                const member = await interaction.guild.members.fetch(interaction.user.id);

                if (!staffRoleId || !member.roles.cache.has(staffRoleId)) {
                    return interaction.reply({
                        content: "❌ This command is restricted to staff members.",
                        ephemeral: true,
                    });
                }
            }

           	// Check for linked accounts
		   	if (command.linked) {
   				 const linked = await isLinked(interaction.user.id);
    			if (!linked) {
        			// Use the promptAccountLink embed if the user is not linked
        			const linkPrompt = promptAccountLink(interaction.user);
        			return interaction.reply({ ...linkPrompt, ephemeral: true });
    			}
			}

            // Execute the command
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: "There was an issue while executing that command!",
                ephemeral: true,
            });
        }
    },
};