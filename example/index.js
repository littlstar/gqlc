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

function addUser (opts) {
  return executeAction('addUser', opts)
}

/**
 * Modify a user in the data set.
 *
 * @public
 * @param {Object} opts
 */

function modifyUser (opts) {
  return executeAction('modifyUser', opts)
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

function addPet (opts) {
  return executeAction('addPet', opts)
}

/**
 * Modify a pet in the data set.
 *
 * @public
 * @param {Object} opts
 */

function modifyPet (opts) {
  return executeAction('modifyPet', opts)
}


addUser({name: 'Tyler', age: 27, gender: 'Male', friends: ['Joseph']})
.then(result => {
  console.log(result.data)
  getUser({name: 'Tyler'})
  .then(result => console.log(result.data.user))
  .catch(err => console.error(err.stack || err))
})

