'use strict'

import { select, insert, update } from '../db'

/**
 * Mutation field resolvers
 */

export const fields = () => ({
  addUser: {
    resolve (_, args = {}) {
      return insert()
      .into('users')
      .values(args)
    }
  },

  modifyUser: {
    resolve (_, args = {}) {
      return update('users')
      .set(args)
      .where({name: args.name})
    }
  },

  addPet: {
    resolve (_, args = {}) {
      return insert()
      .into('pets')
      .values(args)
    }
  },

  modifyPet: {
    resolve (_, args = {}) {
      return update('pets')
      .set(args)
      .where({name: args.name})
    }
  },
})
