'use strict'

import { Kind } from 'graphql/language'

/**
 * Number type representing a float
 * or an integer.
 */

export const Number = {
  serialize (value) {
    return parseFloat(value)
  },

  parseValue (value) {
    return parseFloat(value)
  },

  parseLiteral (node) {
    switch (node.kind) {
      case Kind.FLOAT:
      case Kind.INT:
        return parseFloat(node.value)
    }
    return null
  }
}

/**
 * Void type repsenting an undefined
 * or null data type.
 */

export const Void = {
  serialize: () => null,
  parseValue: () => null,
  parseLiteral: () => null,
}
