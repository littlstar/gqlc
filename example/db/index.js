'use strict'

/**
 * Module dependencies.
 */

import { readFileSync } from 'fs'

/**
 * Graph data.
 */

export const data = {
  users: require('../data/users'),
  pets: require('../data/pets'),
}

/**
 * Simple data selector.
 *
 * @return {Object}
 */

export function select () {
  return {

    /**
     * Picks data set by type.
     *
     * @param {String} type
     * @return {Object}
     */

    from (type) {
      const set = data[type].data
      return {

        /**
         * Picks from data set where filtering
         * based on conditions.
         */

        where (condition = {}) {
          return Promise.resolve(set.filter(filter))
          function filter (item) {
            return Object
            .keys(condition)
            .every((key) => condition[key] == item[key])
          }
        }
      }
    }
  }
}
