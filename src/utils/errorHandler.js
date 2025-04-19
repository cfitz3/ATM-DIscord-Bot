async function oopsie(interaction, error) {
    console.error('An error occurred:', error);

    let errorMessage = 'OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!';

    if (error.message.includes('SQLError') && error.message.includes('discord_username')) {
        errorMessage = '❌ User not found. Your account is not linked. How did you run this command?';
    } else if (error.message.includes('database')) {
        errorMessage = '❌ A database error occurred. Please contact the server administrator.';
    } else if (error.message.includes('permission')) {
        errorMessage = '❌ You do not have permission to use this command.';
    }

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: errorMessage, ephemeral: true });
    } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
    }
}

module.exports = { oopsie };