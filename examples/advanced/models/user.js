'use strict'

import { select } from '../db'

/**
 * User class model type.
 */

export class User extends Object {

  /**
   * Finds a set of users.
   *
   * @public
   * @static
   * @param {Object} condition
   * @return {Promise}
   */

  static find (condition = {}) {
    return select().from('users').where(condition)
  }

  /**
   * Finds a single user.
   *
   * @public
   * @static
   * @param {Object} condition
   * @return {Promise}
   */

  static findOne (condition = {}) {
    return select()
    .from('users')
    .where(condition, {limit: 1})
    .then((results) => results[0])
  }
}
