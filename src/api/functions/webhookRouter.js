const express = require('express');
const router = express.Router();
const { handleCrashReport } = require('./crashHandler.js'); // Adjust the path as needed

router.use(express.json());

router.post('/uptime-kuma', async (req, res) => {
    try {
        const { serverName, status } = req.body;

        if (!serverName || !status) {
            return res.status(400).send('Invalid payload: Missing serverName or status.');
        }

        console.log(`Received webhook from Uptime Kuma: serverName=${serverName}, status=${status}`);

        if (status === 'down') {
            console.log(`Server ${serverName} is down. Initiating crash report analysis...`);
            await handleCrashReport(serverName, req.body.guildId || 'default-guild-id');
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;