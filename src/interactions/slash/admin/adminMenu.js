const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    TextDisplayBuilder,
    ContainerBuilder
} = require('discord.js');

const adminTitle = new TextDisplayBuilder().setContent('**Admin Menu**');
const adminDesc = new TextDisplayBuilder().setContent(
    'Welcome to the Administrator control panel! Don\'t mess anything up!'
);
const adminFooter = new TextDisplayBuilder().setContent(
    '_If anything breaks let me know ASAP - Wither_'
);

const adminContainer = new ContainerBuilder().addTextDisplayComponents(
    adminTitle,
    adminDesc,
    adminFooter
);

const restartGuildButton = new ButtonBuilder()
    .setCustomId('restartGuildButton')
    .setLabel('Restart Guild Bot')
    .setStyle(ButtonStyle.Danger);

const sendServerMenuButton = new ButtonBuilder()
    .setCustomId('sendServerMenu')
    .setLabel('Send Server Menu')
    .setStyle(ButtonStyle.Success);

const ticketsLinkButton = new ButtonBuilder()
    .setLabel('Ticket Dashboard')
    .setURL(`http://195.201.242.60:8169/settings/1176585490636488794`)
    .setStyle(ButtonStyle.Link);

const startJobsButton = new ButtonBuilder()
    .setCustomId('startJobsButton')
    .setLabel('Start Jobs')
    .setStyle(ButtonStyle.Success);

const helpRow = new ActionRowBuilder()
    .addComponents(sendServerMenuButton, ticketsLinkButton, restartGuildButton, startJobsButton);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adminmenu')
        .setDescription('Admin Command. Sends the admin menu with server menu button.'),

    async execute(interaction) {
        await interaction.reply({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [adminContainer, helpRow]
        });
    },
};