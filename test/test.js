'use strict'

import {graphql} from 'graphql'
import extend from 'extend'
import gqlc from '../src'

class Thing {
  constructor () {
    this.id = Math.random().toString('16').slice(2)
  }

  toJSON () {
    return extend(true, {}, this)
  }
}

class Person extends Thing {
  constructor ({name, age, gender, nickName} = {}) {
    super()
    this.nickName = nickName
    this.friends = []
    this.gender = gender
    this.scalar = Math.random()
    this.name = name
    this.pets = []
    this.age = age
  }
}

class Pet extends Thing {
  constructor ({age, name, gender, owner, type} = {}) {
    super()
    this.gender = gender
    this.owner = owner
    this.name = name
    this.type = type
    this.age = age
  }
}

function select (fields = []) {
  return {
    from (what) {
      return {
        where (conditions = {}) {
          const selected = data[what]
          .filter(datum => {
            return Object.keys(conditions).every(key => {
              return conditions[key] == datum[key]
            })
          })
          .map(datum => {
            if (null == fields || (fields && 0 == fields.length)) {
              return datum
            } else {
              return Object.keys(datum).reduce((object, key) => {
                if (-1 != fields.indexOf(key))
                  object[key] = datum[key]
                return object
              }, {})
            }
          })

          return Promise.resolve(selected)
        }
      }
    }
  }
}

const data = {
  people: [
    new Person({name: 'joseph', nickName: 'werle', age: 25, gender: 'Male'}),
    new Person({name: 'denni', age: 25, gender: 'Male'}),
    new Person({name: 'lyndsay', age: 25, gender: 'Female'}),
    new Person({name: 'tyler', age: 27, gender: 'Male'}),
    new Person({name: 'hank', age: 50, gender: 'Male'}),
    new Person({name: 'betty', age: 40, gender: 'Female'}),
    new Person({name: 'sally', age: 30, gender: 'Female'}),
  ],

  pets: [
    new Pet({name: 'apollo', age: 10, gender: 'Male', type: 'dog'}),
    new Pet({name: 'axel', age: 9, gender: 'Male', type: 'dog'}),
    new Pet({name: 'bradley', age: 3, gender: 'Male', type: 'dog'}),
    new Pet({name: 'siena', age: 5, gender: 'Female', type: 'cat'}),
    new Pet({name: 'biba', age: 0.8, gender: 'Male', type: 'cat'}),
    new Pet({name: 'lassy', age: 3, gender: 'Male', type: 'dog'}),
  ]
}

makeFriendship(0, 1)
makeFriendship(0, 2)
makeFriendship(0, 3)
makeFriendship(0, 4)
makeFriendship(1, 2)
makeFriendship(1, 3)
makeFriendship(2, 3)
makeFriendship(4, 5)
makeFriendship(4, 6)

claimPet(0, 0)
claimPet(0, 1)
claimPet(0, 2)
claimPet(1, 5)
claimPet(2, 3)

function makeFriendship (ai, bi) {
  const A = data.people[ai]
  const B = data.people[bi]
  if (-1 == A.friends.indexOf(B.id)) {
    A.friends.push(B.id)
    // connect
    makeFriendship(bi, ai)
  }
}

function claimPet (oi, pi) {
  const pet = data.pets[pi]
  const owner = data.people[oi]
  pet.owner = owner.id
  if (-1 == owner.pets.indexOf(pet.id)) {
    owner.pets.push(pet.id)
  }
}

function getter (property) {
  return result => result[property]
}

function collect (property, table) {
  return object => {
    return Promise.all(object[property].map(id => {
      return select()
      .from(table)
      .where({id: id})
      .then(results => results[0])
    }))
  }
}

describe('Parser', () => {
  it("foo", (done) => {
    const src = `
      enum Gender { Male, Female, Other }

      scalar CustomScalar

      interface Person {
        id: String!
        age: Int!
        pets: [Pet]
        name: String!
        gender: Gender!
        friends: [Person]
      }

      interface Pet {
        id: String!
        age: Int!
        name: String!
        owner: Person!
        gender: Gender!
      }

      type Friend implements Person {
        id: String!
        age: Int!
        pets: [Pet]
        name: String!
        gender: Gender!
        friends: [Person]
      }

      extend type Friend {
        nickName: String
        scalar: CustomScalar
      }

      type Dog implements Pet {
        id: String!
        age: Int!
        name: String!
        owner: Person!
        gender: Gender!
      }

      type Cat implements Pet {
        id: String!
        age: Int!
        name: String!
        owner: Person!
        gender: Gender!
      }

      union Mammal = Friend | Dog | Cat

      input FriendInput {
        id: String!
        age: Int!
        pets: [Pet]
        name: String!
        gender: Gender!
        friends: [Person]
      }

      type Query {
        friend (name: String, age: Int, gender: Gender): Friend
        mammal (name: String, age: Int, gender: Gender): [Mammal]
      }

      type Mutation {
        addFriend (name: String, age: Int, gender: Gender): Friend
      }
    `

    const implementation = {
      Query: {
        fields: () => ({
          friend: {
            resolve(_, args = {}) {
              return select()
              .from('people')
              .where(args)
              .then(result => result[0])
            }
          },

          mammal: {
            resolve (_, args = {}) {
              return Promise
              .all([
                select().from('people').where(args),
                select().from('pets').where(args),
              ])
              .then(results => {
                return results.reduce((a, m) => a.concat(m), [])
              })
              .then(results => {
                return results
              })
            }
          }
        })
      },

      Person: {
        fields: () => ({
          id: { resolve: getter('id') },
          age: { resolve: getter('age') },
          name: { resolve: getter('name') },
          gender: { resolve: getter('gender') },
        }),

        resolveType (thing) {
          return parser.types.Friend
        }
      },

      Pet: {
        fields: () => ({
          id: { resolve: getter('id') },
          age: { resolve: getter('age') },
          name: { resolve: getter('name') },
          gender: { resolve: getter('gender') },
          owner: {
            resolve (pet) {
              return select()
              .from('people')
              .where({id: pet.owner})
              .then(results => results[0])
            }
          },
        }),

        resolveType (pet) {
          switch (pet.type) {
            case 'dog': return parser.types.Dog
            case 'cat': return parser.types.Cat
          }
          return null
        }
      },

      Friend: {
        fields: () => ({
          pets: { resolve: collect('pets', 'pets') },
          friends: { resolve: collect('friends', 'people') },
          nickName: { resolve: getter('nickName') },
          scalar: { resolve: getter('scalar') },
        }),
      },

      Mammal: {
        resolveType (mammal) {
          if (mammal instanceof Person) {
            return parser.types.Friend
          }
          if (mammal instanceof Pet) {
            if ('cat' == mammal.type)
              return parser.types.Cat
            if ('dog' == mammal.type)
              return parser.types.Dog
          }
        }
      },

      CustomScalar: {
        serialize (value) {
          return 'number' == typeof value && value == value ? value : null
        }
      },

      Mutation: {
        fields: () => ({
          addFriend: {
            resolve(_, args = {}) {
              const person = new Person(args)
              data.people.push(person)
              return person
            }
          }
        })
      }
    }

    const parser = gqlc(implementation)
    parser
    .compile(src)
    .then(onDone)
    .catch(done)

    function onDone (schema) {
      const query = `
        mutation {
          addFriend(name: "wells", age: 25, gender: Male) {
            id, name, age, gender, scalar
          }
        }
      `
      graphql(schema, query)
      .then(result => {
        if (result.data) {
          console.log(result.data)
          done()
        } else if (result.errors) {
          console.error(result.errors)
          done(result.errors)
        }
      })
      .catch(err => {
        Error.captureStackTrace(err)
        done(err)
      })
    }
  })
})
