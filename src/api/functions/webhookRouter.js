const express = require('express');
const { handleCrashReport } = require('./crashHandler.js'); // Adjust the path as needed

const router = express.Router();

router.post('/uptime-kuma', async (req, res) => {
    try {
        let body = req.body;

        // If req.body is empty, parse the raw body manually
        if (!body || Object.keys(body).length === 0) {
            console.log('Body is empty, attempting to parse raw body...');
            const rawBody = await new Promise((resolve, reject) => {
                let data = '';
                req.on('data', chunk => (data += chunk));
                req.on('end', () => resolve(data));
                req.on('error', err => reject(err));
            });

            try {
                body = JSON.parse(rawBody);
            } catch (error) {
                console.error('Failed to parse raw body as JSON:', rawBody);
                return res.status(400).send('Invalid payload: Body is not valid JSON.');
            }
        }

        console.log('Parsed webhook payload:', body);

        const { serverName, status } = body;

        if (!serverName || !status) {
            return res.status(400).send('Invalid payload: Missing serverName or status.');
        }

        console.log(`Received webhook from Uptime Kuma: serverName=${serverName}, status=${status}`);

        if (status === 'down') {
            console.log(`Server ${serverName} is down. Initiating crash report analysis...`);
            await handleCrashReport(serverName, body.guildId || 'default-guild-id'); // Replace with actual guildId logic
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;