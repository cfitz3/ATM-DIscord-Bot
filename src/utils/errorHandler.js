async function oopsie(interaction, error) {
    console.error('An error occurred:', error);

    let errorMessage = '❌ An unexpected error occurred. Please try again later.';

    if (error.message.includes('SQLError') && error.message.includes('discord_username')) {
        errorMessage = '❌ User not found. Please make sure you have run /vote and linked your account.';
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