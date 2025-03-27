const redis = require('redis');
const { Client, Intents } = require('discord.js');
const { incrementUserCredit } = require('../../features/credits.js'); // Adjust the path as necessary

// Create Redis clients for publishing and subscribing
const redisPublisherClient = redis.createClient({
  url: 'redis://:A1b2C3d4E5@65.109.52.56:60006'
});

const redisSubscriberClient = redis.createClient({
  url: 'redis://:A1b2C3d4E5@65.109.52.56:60006'
});

// Error handling for publisher client
redisPublisherClient.on('error', (err) => {
  console.error('Redis publisher client error:', err);
});

// Error handling for subscriber client
redisSubscriberClient.on('error', (err) => {
  console.error('Redis subscriber client error:', err);
});

// Function to connect the Redis clients
async function connectRedis(client) {
  try {
    if (!client.isOpen) {
      await client.connect();
      console.log('Connected to Redis server');
    } else {
      console.log('Redis client already connected');
    }
  } catch (err) {
    console.error('Redis connection error:', err);
  }
}

// Connect to Redis for both clients
connectRedis(redisPublisherClient);
connectRedis(redisSubscriberClient);

async function publishMessage(channel, triggerKeyword, username) {
  if (!redisPublisherClient.isOpen) {
    console.error('Redis publisher client is not connected');
    return;
  }

  try {
    const payload = JSON.stringify({ triggerKeyword, username }); // Construct the payload with triggerKeyword and username
    const reply = await redisPublisherClient.publish(channel, payload);
    
    console.log(`Message published to Redis channel '${channel}': ${reply}`);
    console.log(`Payload: ${payload}`);
  } catch (err) {
    console.error('Error publishing message to Redis:', err);
  }
}

// Function to handle incoming messages and send to Discord channel as an embed
async function handleRedisMessage(client, discordChannelId, message) {
  try {
    const parsedPayload = JSON.parse(message); // Parse the incoming message JSON
    console.log('Parsed Payload:', parsedPayload);

    // Increment credits for the user
    await incrementUserCredit(parsedPayload.username, 10); // Adjust the amount as necessary

    const channel = await client.channels.fetch(discordChannelId);
    if (channel) {
      const embed = {
         // Soft purple color
          title: '🎉 New Server Vote!',
          description: `New vote cast on ${parsedPayload.serviceName}. You have been awarded 10 credits! 🎉`, // Adjust the credits as necessary
        fields: [
          {
        name: 'By',
        value: parsedPayload.username,
        inline: true
          },
          {
        name: 'Timestamp',
        value: new Date(parsedPayload.timestamp * 1000).toLocaleString(), // Convert timestamp to readable date
        inline: true
          }
        ],
        timestamp: new Date(),
      };

      await channel.send({ embeds: [embed] });
    } else {
      console.error('Discord channel not found');
    }
  } catch (err) {
    console.error('Error handling Redis message:', err);
  }
}

// Function to subscribe to a Redis channel and handle incoming messages
async function subscribeToChannel(client, discordChannelId, redisChannel) {
  try {
    if (!redisSubscriberClient.isOpen) {
      console.log('Subscriber client is not open, connecting...');
      await redisSubscriberClient.connect();
    } else {
      console.log('Subscriber client already connected');
    }
    console.log(`Subscribing to Redis channel '${redisChannel}'...`);
    await redisSubscriberClient.subscribe(redisChannel, (message) => {
      console.log('Payload Received:', message);
      handleRedisMessage(client, discordChannelId, message);
    });
    console.log(`Subscribed to Redis channel '${redisChannel}'`);
  } catch (err) {
    console.error('Redis connection error:', err); 
  }
}

module.exports = {
  redisPublisherClient,
  publishMessage,
  subscribeToChannel,
  connectRedis
};