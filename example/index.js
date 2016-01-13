'use strict'

import { executeAction, types } from './schema'

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
 * Add a user to the data set.
 *
 * @public
 * @param {Object} opts
 */

export function addUser (opts) {
  return executeAction('addUser', opts)
}

/**
 * Modify a user in the data set.
 *
 * @public
 * @param {Object} opts
 */

export function modifyUser (opts) {
  return executeAction('modifyUser', opts)
}

/**
 * Remove a user from the data set.
 *
 * @public
 * @param {Object} opts
 */

export function removeUser (opts) {
  return executeAction('removeUser', opts)
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

/**
 * Add a pet to the data set.
 *
 * @public
 * @param {Object} opts
 */

export function addPet (opts) {
  return executeAction('addPet', opts)
}

/**
 * Modify a pet in the data set.
 *
 * @public
 * @param {Object} opts
 */

export function modifyPet (opts) {
  return executeAction('modifyPet', opts)
}

/**
 * Remove a pet from the data set.
 *
 * @public
 * @param {Object} opts
 */

export function removePet (opts) {
  return executeAction('removePet', opts)
}
