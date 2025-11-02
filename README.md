# Prerequisites

- latest Node.js
- npm

# Installation

In each folder, run:
```sh
$ npm install
```

# How to start

Start in different ternomals

## Server 1
```sh
$ cd server1
$ npm run start
```

## Server 2
```sh
$ cd server2
$ npm run start
```

## GraphQL Stitching server
```sh
$ cd stitch
$ node ./gateway.js
```

# How to check

1. Use this URL in a browser: http://localhost:3000
2. Click "Visit GraphQL"
3. Enter this query:
```graphql
query {
  users {
    id
    name
  }

  posts {
    id
    title
    content  
  }
}
```
4. Click "Execute Query"
5. You should see the response from the server 1 and server 2
