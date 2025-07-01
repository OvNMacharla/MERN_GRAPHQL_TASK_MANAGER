const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const {connectDB} = require('./config/database');
const { connectRedis } = require('./config/redis');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const auth = require('./middleware/auth');
const config = require('./config/config');

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Connect to databases
  await connectDB();
  await connectRedis();

  // Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const { user } = await auth(req);
      return { user };
    },
    introspection: config.NODE_ENV !== 'production',
    playground: config.NODE_ENV !== 'production'
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Task Manager API' });
  });

  app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${config.PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});