const redis = require('redis');
const { incrementUserCredit } = require('../functions/credits.js');
const config = require('../../../config.json');


// Create Redis clients
const redisPublisherClient = redis.createClient({ url: config.redis.url });
const redisSubscriberClient = redis.createClient({ url: config.redis.url });

// Connect Redis clients
async function connectRedis(client) {
    try {
        if (!client.isOpen) {
            await client.connect();
            console.log('Connected to Redis server.');
        }
    } catch (err) {
        console.error('Redis connection error:', err);
        process.exit(1);
    }
}

// Initialize Redis clients
async function initializeRedisClients() {
    await connectRedis(redisPublisherClient);
    await connectRedis(redisSubscriberClient);
    console.log('Redis clients initialized.');
}

// Handle incoming Redis messages
async function handleRedisMessage(client, discordChannelId, message) {
    try {
        const { username, serviceName, timestamp } = JSON.parse(message);
        const CREDIT_AMOUNT = config.economy.vote_credits
        await incrementUserCredit(username, CREDIT_AMOUNT);

        const channel = await client.channels.fetch(discordChannelId);
        if (channel) {
            const embed = {
                title: '🎉 New Server Vote!',
                description: `New vote cast on ${serviceName}. You have been awarded ${CREDIT_AMOUNT} credits! 🎉`,
                fields: [
                    { name: 'By', value: username, inline: true },
                    { name: 'Timestamp', value: new Date(timestamp * 1000).toLocaleString(), inline: true },
                ],
                timestamp: new Date(),
            };
            await channel.send({ embeds: [embed] });
        } else {
            console.error('Discord channel not found.');
        }
    } catch (err) {
        console.error('Error handling Redis message:', err);
    }
}

// Subscribe to a Redis channel
async function subscribeToChannel(client, discordChannelId) {
    try {
        if (!redisSubscriberClient.isOpen) {
            await redisSubscriberClient.connect();
        }
        console.log(`Subscribing to Redis channel '${config.redis.vote_channel}'...`);
        await redisSubscriberClient.subscribe(config.redis.vote_channel, (message) => {
            handleRedisMessage(client, discordChannelId, message);
        });
        console.log(`Subscribed to Redis channel '${config.redis.vote_channel}'.`);
          } catch (err) {
        console.error('Redis subscription error:', err);
    }
}

module.exports = {
    initializeRedisClients,
    subscribeToChannel,
};