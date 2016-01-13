'use strict'

/**
 * Number type representing a float
 * or an integer.
 */

export const Number = {
  serialize (value) {
    return parseFloat(value)
  }
}
