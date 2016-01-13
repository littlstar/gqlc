'use strict'

import { state } from '../state'
import { User } from '../models'

/**
 * Pet fields.
 */

export const fields = () => ({
  owner: {
    resolve (pet) {
      return User.findOne({name: pet.owner})
    }
  }
})
