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

// Load posts data
const postsData = JSON.parse(
  readFileSync(join(__dirname, 'data', 'posts.json'), 'utf-8')
);

const typeDefs = `#graphql
  scalar UUID

  type Post {
    id: UUID
    title: String
    content: String
  }

  type Query {
    post(id: UUID!): Post
    posts: [Post!]!
  }
`;

const resolvers = {
  UUID: UUIDResolver,
  Query: {
    post: (_, { id }) => {
      return postsData.find(post => post.id === id) || null;
    },
    posts: () => {
      return postsData;
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
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

