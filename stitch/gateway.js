const { createServer } = require('http');
const { createYoga } = require('graphql-yoga');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { schemaFromExecutor } = require('@graphql-tools/wrap');
const { print } = require('graphql');
const fetch = require('cross-fetch');

function getRequestHeaders(context, requestHeaderNames) {
  return requestHeaderNames.reduce((acc, headerName) => {
    acc[headerName] = context.request.headers.get(headerName);
    return acc;
  }, {});
}

function createCustomExecutor(uri) {
  return async ({ document, variables, context, operationName, extensions }) => {
    const requestHeaders = getRequestHeaders(context, ['authorization', 'cookies']);

    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...requestHeaders,
      },
      body: JSON.stringify({
        query: print(document),
        variables,
        operationName,
        extensions,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      return { errors: result.errors };
    }

    return result;
  };
}

async function createRemoteSchema(uri) {
  const executor = createCustomExecutor(uri);
  
  const subschema = {
    schema: await schemaFromExecutor(executor),
    executor,
  };

  return subschema;
}

async function main() {
  try {
    console.log('Fetching schemas from remote servers...');
    
    const [schema1, schema2] = await Promise.all([
      createRemoteSchema('http://localhost:4000/graphql'),
      createRemoteSchema('http://localhost:5000/graphql'),
    ]);

    console.log('Stitching schemas together...');
    const gatewaySchema = stitchSchemas({
      subschemas: [
        schema1,
        schema2,
      ],
    });

    const yoga = createYoga({ 
      schema: gatewaySchema,
      graphqlEndpoint: '/graphql',
      context: ({ request }) => {
        return { request };
      },
    });
    
    const server = createServer(yoga);

    server.listen(3000, () => {
      console.log('✓ Gateway is running on http://localhost:3000/graphql');
      console.log('✓ Connected to servers:');
      console.log('  - http://localhost:4000/graphql');
      console.log('  - http://localhost:5000/graphql');
    });
  } catch (err) {
    console.error('Failed to start gateway:', err);
    process.exit(1);
  }
}

main();
