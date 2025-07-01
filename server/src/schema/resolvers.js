const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');
const config = require('../config/config');
const { getRedisClient } = require('../config/redis');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: '7d' });
};

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return user;
    },

    getTasks: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const redis = getRedisClient();
      const cacheKey = `tasks:${user.id}`;
      
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.error('Redis error:', err);
      }

      const tasks = await Task.find({ userId: user.id })
        .populate('userId')
        .sort({ createdAt: -1 });

      try {
        await redis.setEx(cacheKey, 300, JSON.stringify(tasks)); // 5 min cache
      } catch (err) {
        console.error('Redis cache error:', err);
      }

      return tasks;
    },

    getTask: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const task = await Task.findOne({ _id: id, userId: user.id }).populate('userId');
      if (!task) throw new Error('Task not found');
      
      return task;
    }
  },

  Mutation: {
    register: async (_, { input }) => {
      const { username, email, password } = input;
      
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = new User({ username, email, password });
      await user.save();

      const token = generateToken(user.id);
      return { token, user };
    },

    login: async (_, { input }) => {
      const { email, password } = input;
      
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken(user.id);
      return { token, user };
    },

    createTask: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const task = new Task({
        ...input,
        userId: user.id
      });

      await task.save();
      await task.populate('userId');

      // Clear cache
      const redis = getRedisClient();
      try {
        await redis.del(`tasks:${user.id}`);
      } catch (err) {
        console.error('Redis cache clear error:', err);
      }

      return task;
    },

    updateTask: async (_, { id, input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const task = await Task.findOneAndUpdate(
        { _id: id, userId: user.id },
        input,
        { new: true }
      ).populate('userId');

      if (!task) throw new Error('Task not found');

      // Clear cache
      const redis = getRedisClient();
      try {
        await redis.del(`tasks:${user.id}`);
      } catch (err) {
        console.error('Redis cache clear error:', err);
      }

      return task;
    },

    deleteTask: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const task = await Task.findOneAndDelete({ _id: id, userId: user.id });
      if (!task) throw new Error('Task not found');

      // Clear cache
      const redis = getRedisClient();
      try {
        await redis.del(`tasks:${user.id}`);
      } catch (err) {
        console.error('Redis cache clear error:', err);
      }

      return true;
    }
  }
};

module.exports = resolvers;
