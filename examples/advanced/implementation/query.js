'use strict'

import { select } from '../db'

/**
 * Query fields.
 */

export const fields = () => ({

  /**
   * Queries a single user
   */

  user: {
    resolve (_, args = {}) {
      return select().from('users').where(args).then(results => results[0])
    }
  },

  /**
   * Queries a set of users.
   */

  users: {
    resolve (_, args = {}) {
      return select().from('users').where(args)
    }
  },

  /**
   * Queries a single pet.
   */

  pet: {
    resolve (_, args = {}) {
      return select().from('pets').where(args).then(results => results[0])
    }
  },

  /**
   * Queries a set of pets.
   */

  pets: {
    resolve (_, args = {}) {
      return select().from('pets').where(args)
    }
  }
})
