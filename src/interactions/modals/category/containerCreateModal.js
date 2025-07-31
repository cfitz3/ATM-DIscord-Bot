const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    buildServerMenuModal() {
        return new ModalBuilder()
            .setCustomId('containerCreateModal')
            .setTitle('Create Container Menu')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('menuTitle')
                        .setLabel('Menu Title')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('menuDescription')
                        .setLabel('Menu Description')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('inputField1')
                        .setLabel('Input FIeld 1')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('inputField2')
                        .setLabel('Input Field 2')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('inputField3')
                        .setLabel('Input Field 3')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                )
            );
    }
};
