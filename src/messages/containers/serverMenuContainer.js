const {
    TextDisplayBuilder,
    ContainerBuilder,
    MediaGalleryBuilder,
} = require('discord.js');

function serverMenuContainer() {
    const titleAndDesc = new TextDisplayBuilder().setContent(
        '## <:arrow:1387213367982297189> Our Servers\n' +
        '\nPick a server from the menu below to get a step-by-step guide and all the info you need!'
    );
    const spacer = new TextDisplayBuilder().setContent('\u200b');
    const serverList = new TextDisplayBuilder().setContent(
        '<:dot:1387217386024992839> **All The Mods 10**\n-# A kitchen-sink modpack, focused on tech and logistic automation.\n\n' +
        '<:dot:1387217386024992839> **Yet Another Vanilla+ Pack**\n-# A community-driven pack. Focused on adding depth and immersion to existing mechanics.\n\n' 
    );
    const support = new TextDisplayBuilder().setContent(
        '> Have an issue? Feel free to open a ticket in #support.'
    );
    const footerImage = new MediaGalleryBuilder().addItems([
    {
        media: {
            url: 'https://i.imgur.com/Y5pCOqz.png'
        }
    }
]);

    return new ContainerBuilder().addTextDisplayComponents(
        titleAndDesc,
        spacer,
        serverList,
        support
    ).addMediaGalleryComponents(
        footerImage
    );  
   
}

module.exports = { serverMenuContainer };