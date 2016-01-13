'use strict'

import { select } from '../db'

/**
 * Pet class model type.
 */

export class Pet extends Object {

  /**
   * Finds a set of pets.
   *
   * @public
   * @static
   * @param {Object} condition
   * @return {Promise}
   */

  static find (condition = {}) {
    return select().from('pets').where(condition)
  }

  /**
   * Finds a single pet.
   *
   * @public
   * @static
   * @param {Object} condition
   * @return {Promise}
   */

  static findOne (condition = {}) {
    return select()
    .from('pets')
    .where(condition, {limit: 1})
    .then((results) => results[0])
  }
}
