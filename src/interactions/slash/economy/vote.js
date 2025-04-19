const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUUID } = require('../../../api/constants/mowojangAPI.js');
const mariaDB = require('../../../api/constants/sql.js');
const { isLinked } = require('../../../api/functions/credits.js');
const { oopsie } = require('../../../utils/errorHandler.js');
const { promptAccountLink } = require('../../../responses/embeds/linkPrompt.js');

const embed = new EmbedBuilder()
    .setColor(0xFF69B4)
    .setTitle('Voting Sites')
    .setAuthor({ name: 'ATM Guild Bot', iconURL: 'https://i.imgur.com/eboO5Do.png' })
    .setDescription('Our servers are and always will be free to play. Please consider voting for us on the following sites. Voting helps us grow and attract new players to the community!')
    .addFields(
        { name: 'Craft to Exile 2:', value: '[MCSL](https://minecraft-server-list.com/server/510426/)', inline: true }
    )
    .addFields(
        { name : 'All the Mods 10:', value: '[MCSL](https://minecraft-server-list.com/server/510233/)', inline: true }
    )
    .setTimestamp()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for our servers!')
        .addStringOption(option =>
            option.setName('minecraft_username')
                .setDescription('Your Minecraft username.')
                .setRequired(true)),

                async execute(interaction) {
                    try {
                      const linked = await isLinked(interaction.user.id);
                      if (!linked) {
                      await promptAccountLink(interaction);
                        return;
                      }
                    } catch (err) {
                        await oopsie(interaction, err);
                        return;
                    }
            try {
                // Defer the reply
                await interaction.deferReply({ ephemeral: true });

                // Get the player name from the interaction options
                const minecraft_username = interaction.options.getString('minecraft_username');

                // Fetch player UUID from Mojang API
                const minecraft_uuid = await getUUID(minecraft_username);

                if (!minecraft_uuid) {
                    // If player information is not found, reply with an error message
                    return interaction.editReply({ content: 'Oopsie! This account does not exist. Recheck your input and try again. If you are sure you have entered the correct username, please contact a staff member.' });
                }

                // Insert or update the user data in the database
                const query = `
                    INSERT INTO users (discord_id, discord_username, minecraft_username, minecraft_uuid)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    discord_username = VALUES(discord_username),
                    minecraft_username = VALUES(minecraft_username),
                    minecraft_uuid = VALUES(minecraft_uuid)
                `;
                const values = [interaction.user.id, interaction.user.tag, minecraft_username, minecraft_uuid];

                // Use a connection from the pool for the query
                await mariaDB.query(query, values);

                // Reply with a success message
                await interaction.editReply({ content: `Thank You!`, embeds: [embed] });
            } catch (error) {
                console.error('Error linking account:', error);
                // Reply with an error message if there is an error
                await interaction.editReply({ content: `Error: Unable to link your account` });
            }
        },
    };