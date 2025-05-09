const axios = require('axios');
const config = require('../../../config.json'); // Adjust the path as needed

/**
 * Sends a request to the Perplexity API to analyze the crash report.
 * @param {string} crashReportContents - The contents of the crash report.
 * @returns {Promise<string>} - The explanation generated by the Perplexity API.
 */
async function analyzeCrashReport(crashReportContents) {
    if (!crashReportContents || crashReportContents.trim().length === 0) {
        throw new Error('Crash report contents are empty. Cannot analyze.');
    }

    try {
        const response = await axios.post(config.api.perplexity_api_url, {
            model: 'sonar-deep-research',
            messages: [
                {
                    role: 'user',
                    content: `Analyze the following crash report and provide a summary of the cause and actionable suggestions for fixing it:\n\n${crashReportContents}`,
                },
            ],
            max_tokens: 750,
        }, {
            headers: {
                'Authorization': `Bearer ${config.api.perplexity_api_key}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data && response.data.choices && response.data.choices[0]) {
            const explanation = response.data.choices[0].message.content;

            const summaryMatch = explanation.match(/Summary:(.*?)(Suggestions:|$)/s);
            const suggestionsMatch = explanation.match(/Suggestions:(.*)/s);

            const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available.';
            const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : 'No suggestions available.';

            return { summary, suggestions };
        } else {
            throw new Error('Unexpected response structure from Perplexity API');
        }
    } catch (error) {
        console.error('Error interacting with Perplexity API:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { analyzeCrashReport };