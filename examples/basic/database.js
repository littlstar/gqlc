'use strict'
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
