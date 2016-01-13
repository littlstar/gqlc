'use strict'

import {
  state
} from '../state'

import {
  User,
  Pet
} from '../models'

/**
 * User fields.
 */

export const fields = () => ({
  friends: {
    resolve (user) {
      return Promise.all(user.friends.map(name => {
        return User.findOne({name: name}).then(result => {
          console.log(result, name)
          return result
        })
      }))
    }
  },

  pets: {
    resolve (user) {
      return Promise.all(user.pets.map(name => (
        Pet.findOne({name: name})
      )))
    }
  }
})
