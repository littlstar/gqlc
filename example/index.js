'use strict'

import { executeAction } from './state'

/**
 * Get all users with options.
 *
 * @public
 * @param {?(Object)} opts
 */

export function getUsers (opts = {}) {
  return executeAction('getUsers', opts)
}

/**
 * Get a users with options.
 *
 * @public
 * @param {?(Object)} opts
 */

export function getUser (opts) {
  return executeAction('getUser', opts)
}

/**
 * Get all pets with options.
 *
 * @public
 * @param {?(Object)} opts
 */

export function getPets (opts = {}) {
  return executeAction('getPets', opts)
}

/**
 * Get a pets with options.
 *
 * @public
 * @param {?(Object)} opts
 */

export function getPet (opts) {
  return executeAction('getPet', opts)
}

getUsers({includePets: true).then(results => console.log(results.data))
