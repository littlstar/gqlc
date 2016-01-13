'use strict'

import { state } from '../state'

/**
 * Animal fields.
 */

export const fields = () => ({
  gender: { resolve: (animal) => animal.gender },
  name: { resolve: (animal) => animal.name },
  type: { resolve: (animal) => animal.type },
  age: { resolve: (animal) => animal.age },
})

/**
 * Resolves an incoming objects schema type.
 *
 * @public
 * @param {Mixed} input
 * @return {Mixed}
 */

export function resolveType (input) {
  return state.types.Pet
}
