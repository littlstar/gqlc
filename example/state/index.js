'use strict'

import { mapping as schemas } from '../schema'
import * as implementation from '../implementation'
import { graphql } from 'graphql'
import gqlc from '../../src'

/**
 * GraphQL schema compiled state object.
 *
 * @public
 * @const
 * @type {Compiler}
 */

export const state = gqlc(implementation)

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
  return state
  .compile(compileSources(['interfaces', 'types']))
  .then((schema) => graphql(schema, compileSources([
    'mutations',
    'queries'
  ]), null, vars, action))
}
