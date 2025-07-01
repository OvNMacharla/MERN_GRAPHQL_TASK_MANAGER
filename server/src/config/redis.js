const redis = require('redis');
const config = require('./config');

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: config.REDIS_URL
    });
    
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    await client.connect();
    console.log('Redis Connected');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

const getRedisClient = () => client;

module.exports = { connectRedis, getRedisClient };