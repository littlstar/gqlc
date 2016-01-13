'use strict'

import {
  readFileSync,
  readdirSync,
} from 'fs'

import {
  extname,
  resolve,
} from 'path'

import * as implementation from '../implementation'
import { graphql } from 'graphql'
import gqlc from '../../../src'

/**
 * Read schemas in a given namespace
 * into an object mapping.
 *
 * @private
 * @param {String} namespace
 */

function readSchemas (namespace) {
  const items = readdirSync(resolve(__dirname, namespace))
  const map = {}
  for (let item of items) {
    const ext = extname(item)
    const name = item.replace(ext, '')
    const path = resolve(__dirname, namespace, item)
    map[name] = String(readFileSync(path))
  }
  return map
}

/**
 * Compiles an array of source types defined
 * in the schema object  into a single buffer
 *
 * @private
 * @param {Array<String>} sources
 * @return {String}
 */

function compileSources (sources = []) {
  const topics = {}
  for (let topic in schemas) {
    if (-1 == sources.indexOf(topic))
      continue

    topics[topic] = Object.keys(schemas[topic])
    .reduce((buf, key) => {
      return buf + schemas[topic][key]
    }, '')
  }

  return Object.keys(topics).reduce((buf, key) => {
    return buf + topics[key]
  }, '')
}

function initializeState () {
  const ddl = compileSources([ 'interfaces', 'types' ])
  state.compile(ddl)
}

/**
 * Schema object mapping.
 */

export const schemas  = {
  interfaces: readSchemas('interfaces'),
  fragments: readSchemas('fragments'),
  mutations: readSchemas('mutations'),
  queries: readSchemas('queries'),
  types: readSchemas('types'),
}
/**
 * GraphQL schema compiled state object.
 *
 * @private
 * @const
 * @type {Compiler}
 */

const state = gqlc(implementation)
initializeState()

/**
 * GraphQL schema objects.
 *
 * @public
 */

export const types = state.types
export const enums = state.enums
export const unions = state.unions
export const interfaces = state.interfaces

/**
 * Query graph from derived sources
 *
 * @public
 * @param {String} src
 */

export function query (src, ...args) {
  src = [compileSources([ 'fragments' ]), src].join('\n')
  return state.compile().then((schema) => graphql(schema, src, ...args))
}

/**
 * Executes a named action with optional variables
 * on the current compiled graphql state.
 *
 * @pulic
 * @param {String} action
 * @param {Object} variables
 * @return {Promise<Object>}
 */

export function executeAction (action, vars = {}) {
  const dml = compileSources([ 'mutations', 'queries' ])
  return query(dml, null, vars, action)
}
