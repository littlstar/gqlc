'use strict'
const Data = require('./data.json')
export const User = {
  fields: () => ({
    id: { resolve: (user) => user.id },
    name: { resolve: (user) => user.name },
    friends: {
      resolve (user) {
        return user.friends.map((name) => (
          Data.find((datum) => name == datum.name)
        ))
      }
    }
  })
}

export const Query = {
  fields: () => ({
    user: {
      resolve (_, {id}) {
        return Data.find((datum) => id == datum.id)
      }
    }
  })
}
