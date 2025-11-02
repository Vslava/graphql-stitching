import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { UUIDResolver } from 'graphql-scalars';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load users data
const usersData = JSON.parse(
  readFileSync(join(__dirname, 'data', 'users.json'), 'utf-8')
);

const typeDefs = `#graphql
  scalar UUID

  type User {
    id: UUID
    name: String
  }

  type Query {
    user(id: UUID!): User
    users: [User!]!
  }
`;

const resolvers = {
  UUID: UUIDResolver,
  Query: {
    user: (_, { id }, { req }) => {
      // req доступен здесь
      return usersData.find(user => user.id === id) || null;
    },
    users: (_, __, { req }) => {
      // req доступен здесь
      return usersData;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const port = parseInt(process.env.PORT || '4000', 10);

startStandaloneServer(server, {
  listen: { port },
  context: async ({ req, res }) => {
    console.log('--- headers', req.headers);

    return { req, res };
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

