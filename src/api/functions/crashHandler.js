const { listFiles, readFile } = require('../constants/pterodactyl.js');
const { analyzeCrashReport } = require('../constants/perplexity.js');
const Database = require('../constants/sql.js');



// Function to truncate the crash report at "Mod List:"
function truncateCrashReport(crashReportContents) {
    const cutoffPhrase = "Mod List:";
    const cutoffIndex = crashReportContents.indexOf(cutoffPhrase);

    if (cutoffIndex !== -1) {
        return crashReportContents.slice(0, cutoffIndex).trim();
    }

    // If "Mod List:" is not found, return the original contents
    return crashReportContents;
}



async function handleCrashReport(serverName, guildId) {
    console.log(`Handling crash report for server: ${serverName}, guild ID: ${guildId}`);
    try {
        const crashReportsDirectory = '/crash-reports';

        // List all files in the crash-reports directory
        const files = await listFiles(serverName, crashReportsDirectory);

        if (!files || files.length === 0) {
            console.log(`No crash reports found for server ${serverName}`);
            return null;
        }

        // Find the most recent crash report
        const latestFile = files
            .filter(file => !file.attributes.is_directory) // Ensure it's a file, not a directory
            .sort((a, b) => new Date(b.attributes.modified_at) - new Date(a.attributes.modified_at))[0];

        if (!latestFile) {
            console.log(`No valid crash report files found for server ${serverName}`);
            return null;
        }

        console.log(`Latest crash report for ${serverName}: ${latestFile.attributes.name}`);

        // Read the contents of the latest crash report
        const filePath = `${crashReportsDirectory}/${latestFile.attributes.name}`;
        let crashReportContents = await readFile(serverName, filePath);

        // Truncate the crash report at "Mod List:"
        crashReportContents = truncateCrashReport(crashReportContents);

        // Analyze the crash report using the Perplexity API
        console.log(`Sending crash report to Perplexity API for analysis...`);
        const explanation = await analyzeCrashReport(crashReportContents);
        console.log(`Perplexity API analysis completed successfully.`);

        // Retrieve the crash report webhook URL from the database
        const query = `
            SELECT crash_report_webhook
            FROM server_settings
            WHERE guild_id = ?
        `;
        const [result] = await Database.query(query, [guildId]);

        if (!result || !result.crash_report_webhook) {
            console.error(`No crash report webhook configured for guild ID: ${guildId}`);
            return;
        }

        const webhookUrl = result.crash_report_webhook;

        // Send the crash report to the webhook
        console.log(`Sending crash report to webhook: ${webhookUrl}`);
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `🚨 **Crash Analysis for: ${serverName}**`,
                embeds: [
                    {
                        title: 'Automatic Analysis',
                        description: explanation.slice(0, 2000), // Discord embed limit
                        color: 0xff0000,
                        timestamp: new Date().toISOString(),
                    },
                ],
            }),
        });

        console.log(`Crash report sent successfully to webhook: ${webhookUrl}`);
    } catch (error) {
        console.error(`Error handling crash report for server ${serverName}:`, error.message);
        throw error;
    }
}

module.exports = { handleCrashReport };