'use strict'

/**
 * Module dependencies.
 */

import { readFileSync } from 'fs'
import extend from 'extend'

/**
 * Filter helper.
 *
 * @private
 * @param {Object}
 * @param {Object} condition
 * @return {Array}
 */

function filter (set, condition = {}) {
  return set.filter(predicate)
  function predicate (item) {
    return Object
    .keys(condition)
    .every((key) => condition[key] == item[key])
  }
}

/**
 * Graph data.
 */

export const DataSet = {
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
      const set = DataSet[type].data
      return {

        /**
         * Picks from data set where filtering
         * based on conditions.
         *
         * @param {Object} condition
         */

        where (condition = {}) {
          return Promise.resolve(filter(set, condition))
        }
      }
    }
  }
}

/**
 * Simple insert helper.
 *
 * @public
 * @return {Object}
 */

export function insert () {
  return {

    /**
     * Selects data set to insert into.
     *
     * @param {String} type
     * @return {Object}
     */

    into (type) {
      const set = DataSet[type].data
      return {

        /**
         * Sets values to insert into
         *
         * @param {Object} values
         * @return {Promise}
         */

        values (values) {
          set.push(values)
          return Promise.resolve(values)
        }
      }
    }
  }
}

/**
 * Simple update helper
 *
 * @public
 * @param {String} type
 * @return {Object}
 */

export function update (type) {
  const set = DataSet[type].data
  return {

    /**
     * Provide data to set.
     *
     * @param {Object}
     * @return {Object}
     */

    set (data = {}) {
      return {

        /**
         * Picks from data set where filtering
         * based on conditions.
         *
         * @param {Object} condition
         */

        where (condition = {}) {
          return Promise.resolve(
            filter(set, condition)
            .map((item) => extend(true, item, data))
          )
        }
      }
    }
  }
}
