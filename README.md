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

Below is a simple hello world that query the graph for a fixed resolved value.

```js
import { graphql } from 'graphql'
import gqlc from 'gqlc'

const implementation = {
  Query: {
    fields: () => ({
      hello: { resolve () { return 'world' } }
    })
  }
}

const Schema = `type Query { hello: String }`
const query = `query { hello }`

gqlc(implementation)
.compile(Schema)
.then((schema) => graphql(schema, query))
.then((result) => console.log(result)) // { data: { hello: 'world' } }
.catch((error) => console.error(error))
```

## Examples

* [Basic](exampels/basic)
* [Advanced](exampels/advanced)

## Usage

The `gqlc()` function accepts an optional initial state object and a
required implementation object. The return value of the `gqlc()` function
represents the current state of the schema definition. A GraphQL schema can
be compiled by calling the `.compile()` method on the state object returned
by the `gqlc()` function. A `Promise` providing an instance the `GraphQLSchema`
object is returned. It can be used directly with the `graphql()`
function.

```js
const state = gqlc([initialState,]implementation)
state.compile(schemaSource).then((schema) => graphql(schema, query))
```

## License

MIT
