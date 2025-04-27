const express = require('express');
const webhookRouter = require('../functions/webhookRouter.js'); // Adjust the path as needed

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the webhook router
app.use('/api', webhookRouter);

// Define the port the server will listen on
const PORT = 60013; // You can change this to any desired port

// Export a function to start the server
function startExpressServer() {
    app.listen(PORT, () => {
        console.log(`Express server is running on port ${PORT}`);
    });
}

module.exports = startExpressServer;