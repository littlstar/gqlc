'use strict'

import { types } from '../schema'

/**
 * Person fields.
 */

export const fields = () => ({
  gender: { resolve: (person) => person.gender },
  name: { resolve: (person) => person.name },
  age: { resolve: (person) => person.age },
})

/**
 * Resolves an incoming objects schema type.
 *
 * @public
 * @param {Mixed} input
 * @return {Mixed}
 */

export function resolveType (input) {
  return types.User
}
