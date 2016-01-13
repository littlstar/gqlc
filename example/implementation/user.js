'use strict'

import { User, Pet } from '../models'

/**
 * User fields.
 */

export const fields = () => ({
  friends: {
    resolve (user) {
      return Promise.all(user.friends.map(name => (
        User.findOne({name: name})
      )))
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
