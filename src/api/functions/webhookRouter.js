const express = require('express');
const { handleCrashReport } = require('./crashHandler.js'); // Adjust the path as needed

const router = express.Router();

router.post('/uptime-kuma', async (req, res) => {
    try {
        // Log the raw body for debugging
        console.log('Received webhook payload:', req.body);

        // Ensure req.body is defined
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).send('Invalid payload: Body is missing or not JSON.');
        }

        const { serverName, status } = req.body;

        if (!serverName || !status) {
            return res.status(400).send('Invalid payload: Missing serverName or status.');
        }

        console.log(`Received webhook from Uptime Kuma: serverName=${serverName}, status=${status}`);

        if (status === 'down') {
            console.log(`Server ${serverName} is down. Initiating crash report analysis...`);
            await handleCrashReport(serverName, req.body.guildId || 'default-guild-id'); // Replace with actual guildId logic
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;