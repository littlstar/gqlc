'use strict'

import {
  readFileSync,
  readdirSync,
} from 'fs'

import {
  extname,
  resolve,
} from 'path'

/**
 * Schema object mapping.
 */

export const mapping = {
  interfaces: readSchemas('interfaces'),
  mutations: readSchemas('mutations'),
  queries: readSchemas('queries'),
  types: readSchemas('types'),
}

/**
 * Read schemas in a given namespace
 * into an object mapping.
 *
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
