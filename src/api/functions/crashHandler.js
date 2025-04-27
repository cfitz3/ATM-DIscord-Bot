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

        // Helper function to get the latest crash report
        const latestFile = await getLatestCrashReport(serverName, crashReportsDirectory);
        if (!latestFile) {
            console.log(`No valid crash report files found for server ${serverName}`);
            return null;
        }

        console.log(`Latest crash report for ${serverName}: ${latestFile.attributes.name}`);

        // Read and truncate the crash report
        const filePath = `${crashReportsDirectory}/${latestFile.attributes.name}`;
        let crashReportContents = await readFile(serverName, filePath);
        crashReportContents = truncateCrashReport(crashReportContents);

        // Analyze the crash report
        console.log(`Sending crash report to Perplexity API for analysis...`);
        const { summary, suggestions } = await analyzeCrashReport(crashReportContents);
        console.log(`Perplexity API analysis completed successfully.`);

        // Retrieve webhook URL and send the report
        const webhookUrl = await getWebhookUrl(guildId);
        if (!webhookUrl) {
            console.error(`No crash report webhook configured for guild ID: ${guildId}`);
            return;
        }

        await sendWebhook(webhookUrl, serverName, summary, suggestions);
        console.log(`Crash report sent successfully to webhook: ${webhookUrl}`);
    } catch (error) {
        console.error(`Error handling crash report for server ${serverName}:`, error.message);
        throw error;
    }
}

// Helper functions for modularity
async function getLatestCrashReport(serverName, directory) {
    const files = await listFiles(serverName, directory);
    if (!files || files.length === 0) return null;

    return files
        .filter(file => !file.attributes.is_directory)
        .sort((a, b) => new Date(b.attributes.modified_at) - new Date(a.attributes.modified_at))[0];
}

async function getWebhookUrl(guildId) {
    const query = `
        SELECT crash_report_webhook
        FROM server_settings
        WHERE guild_id = ?
    `;
    const [result] = await Database.query(query, [guildId]);
    return result ? result.crash_report_webhook : null;
}

async function sendWebhook(webhookUrl, serverName, summary, suggestions) {
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `🚨 **Crash Report for Server: ${serverName}**`,
            embeds: [
                {
                    title: 'Crash Report Summary',
                    description: summary.slice(0, 2000),
                    color: 0xff0000,
                    fields: [
                        {
                            name: 'Suggestions',
                            value: suggestions.slice(0, 1024),
                        },
                    ],
                    timestamp: new Date().toISOString(),
                },
            ],
        }),
    });
}

module.exports = { handleCrashReport };