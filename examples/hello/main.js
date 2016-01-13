'use strict'
import { graphql } from 'graphql'
import gqlc from '../../src'

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
.then((result) => console.log(result))
.catch((error) => console.error(error))
