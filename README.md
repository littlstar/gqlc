# gqlc

GraphQL Schema Compiler

*GraphQLC* (or GQLC) is built on
[GraphQS.js](https://github.com/graphql/graphql-js) and
leverages the schema language parser built into GraphQL. GQLC allows users
to define their schemas using the language defined by the [GraphQL
Spec](https://facebook.github.io/graphql), bind implementations for
routines for resolving data, and get a `GraphQLSchema` object to pass
directly to the `graphql()` function. This allows authors to focus on the
implementation details of their graph data set.

## Supported schema language features

* InterfaceTypeDefinition
* ObjectTypeDefinition
* EnumTypeDefinition
* UnionTypeDefinition
* InputObjectTypeDefinition
* TypeExtensionDefinition

## Installation

GQLC is written in ES6 and intended to be used with
[GraphQS.js](https://github.com/graphql/graphql-js) in a Node.js
environment.

```sh
$ npm install --save gqlc
```

## Hello World

In [this example](examples/basic) we will construct a User type and its
implementation. The top level query object will be the `Query` type, which
is by default. The top level mutation object will be the `Mutation` type,
which is by default.

For this example our data set looks like this:

**data.json**:

```json
[{
  "id": 0,
  "name": "Alice",
  "friends": [ "Bob", "Harry", "Sally"]
}, {
  "id": 1,
  "name": "Bob",
  "friends": [ "Alice", "Harry"]
}, {
  "id": 2,
  "name": "Harry",
  "friends": [ "Bob", "Alice", "Sally"]
}, {
  "id": 3,
  "name": "Sally",
  "friends": [ "Alice", "Harry"]
}]
```

A simple schema with a `User` type, `Query` type, and a `userFields`
fragment looks like this:

**schema.gql**:

```graphql
type User {
  id: Int!
  name: String!
  friends: [User]
}

type Query {
  user (id: Int) : User
}
```

The components for how schema data is resolved, validated, and coerced are the
implementation details of a the schema and are required. An implementation for
the above schema should look like this:

**implementation.js**:

```js
const Data = require('./data.json')
export const User = {
  fields: () => ({
    id: { resolve: (user) => user.id },
    name: { resolve: (user) => user.name },
    friends: {
      resolve (user) {
        return user.friends.map((name) => (
          Data.find((datum) => name == datum.name)
        ))
      }
    }
  })
}

export const Query = {
  fields: () => ({
    user: {
      resolve (_, {id}) {
        return Data.find((datum) => id == datum.id)
      }
    }
  })
}
```

The implementation details should be given to the `gqlc()` function after
definition. The return value of the `gqlc()` function represents the
current state of the schema definition. A GraphQL schema can be compiled
by calling the `.compile()` method on the state object returned by the
`gqlc()` function. A `Promise` providing an instance the `GraphQLSchema`
object is returned. It can be used directly with the `graphql()` function
to query the data set above. The the state instance can be abstracted
into a module that represents an API to the data set. This will be the
database. It will expose a `query()` function. The database looks like this:

**database.js**:

```js
import * as implementation from './implementation'
import { readFileSync } from 'fs'
import { graphql } from 'graphql'
import { resolve } from 'path'
import gqlc from '../../src'

const schema = String(readFileSync(resolve(__dirname, './schema.gql')))
const state = gqlc(implementation)

// initialize schema state
state.compile(schema, {filename: 'schema.gql'})

// query graph
export function query (str) {
  return state.compile().then((schema) => graphql(schema, str))
}
```

An example program file could query the graph for a users name, their friends name,
and their friends friends names.

**main.js**:

```js
import { query } from './database'

query(`
  query {
    user (id: 0) {
      name,
      friends { name, friends { name } }
    }
  }
`)
.then((results) => {
  console.log(results.data.user)
  // { name: 'Alice',
  //   friends:
  //    [ { name: 'Bob', friends: [Object] },
  //      { name: 'Harry', friends: [Object] },
  //      { name: 'Sally', friends: [Object] } ] }
})
.catch((error) => {
  console.error(error.stack || error)
})
```

## License

MIT
