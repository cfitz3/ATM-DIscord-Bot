const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: 'redis://:A1b2C3d4E5@5.9.69.205:6380'
});

// Error handling for Redis client
redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

// Function to connect to Redis and perform a test operation
async function testRedisConnection() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Connected to Redis server');
    } else {
      console.log('Redis client already connected');
    }

    // Perform a test operation: set and get a key
    await redisClient.set('testKey', 'testValue');
    const value = await redisClient.get('testKey');
    console.log('Test key value:', value);

    // Disconnect from Redis
    await redisClient.disconnect();
    console.log('Disconnected from Redis server');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
}

// Run the test
testRedisConnection();