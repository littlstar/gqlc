'use strict'

import assert from 'assert'
import gqlc from '../src'

import {
  GraphQLSchema,
  graphql,
} from 'graphql'

describe('gqlc([definitions,]implementation)', () => {
  it("Should require an implementation object.", (done) => {
    try { gqlc() }
    catch (e) { return done() }
    done(new Error("Failed to throw exception."))
  })

  it("Should compile a basic schema", (done) => {
    const compiler = gqlc({
      Query: {
        fields: () => ({
          query: { resolve (_, args) { } }
        })
      }
    })

    assert('object' == typeof compiler,
           "compiler is not an object.")

    assert('object' == typeof compiler.specs,
           ".specs is not an object.")

    assert('object' == typeof compiler.types,
           ".types is not an object.")

    assert('object' == typeof compiler.enums,
           ".enums is not an object.")

    assert('object' == typeof compiler.unions,
           ".unions is not an object.")

    assert('object' == typeof compiler.inputs,
           ".inputs is not an object.")

    assert('object' == typeof compiler.scalars,
           ".scalars is not an object.")

    assert('object' == typeof compiler.interfaces,
           ".interfaces is not an object.")

    assert('object' == typeof compiler.extensions,
           ".extensions is not an object.")

    assert('object' == typeof compiler.implementation,
           ".implementation is not an object.")

    assert('object' == typeof compiler.implementation.Query,
           ".implementation.Query is not an object.")

    assert('function' == typeof compiler.implementation.Query.fields,
           ".implementation.Query.fields is not a function.")

    compiler
    .compile(`
      type Data { value: String }
      type Query {
        query(argument: String): Data
      }
    `)
    .then(schema => {
      assert(schema)
      assert(schema instanceof GraphQLSchema)
      done()
    })
    .catch(done)
  })

  it("Should compile types.", (done) => {
    const compiler = gqlc({
      Query: { fields: () => ({ value: { resolve () {}} }) }
    })
    compiler
    .compile(`type Foo {}
             type Bar {}
             type Query { value: String}`)
    .then((schema) => {
      assert(compiler.specs.Foo)
      assert(compiler.specs.Bar)
      assert(compiler.types.Foo)
      assert(compiler.types.Bar)
      done()
    })
    .catch(done)
  })

  it("Should compile enums.", (done) => {
    const compiler = gqlc({
      Query: { fields: () => ({ value: { resolve () {}} }) }
    })
    compiler
    .compile(`enum Values {One, Two, Three}
             type Query { value: String }`)
    .then((schema) => {
      assert(compiler.enums.Values)
      const values = compiler.enums.Values.getValues()
      assert(values)
      assert('One' == values[0].name)
      assert('Two' == values[1].name)
      assert('Three' == values[2].name)
      done()
    })
    .catch(done)
  })

  it("Should compile unions.", (done) => {
    const compiler = gqlc({
      Query: { fields: () => ({ value: { resolve () {}} }) },
      C: {
        resolveType () {
          return [compiler.types.A, compiler.types.B]
        }
      }
    })
    compiler
    .compile(`type A { }
             type B { }
             union C = A | B
             type Query { value: String }`)
    .then((schema) => {
      assert(compiler.types.A)
      assert(compiler.types.B)
      assert(compiler.unions.C)
      const types = compiler.unions.C.getPossibleTypes()
      assert(types)
      assert('A' == types[0].name)
      assert('B' == types[1].name)
      done()
    })
    .catch(done)
  })

  it("Should compile inputs.", (done) => {
    const compiler = gqlc({
      Query: { fields: () => ({ value: { resolve () {}} }) },
    })
    compiler
    .compile(`input InputA { }
             input InputB { }
             type Query { value: String }`)
    .then((schema) => {
      assert(compiler.inputs.InputA)
      assert(compiler.inputs.InputB)
      done()
    })
    .catch(done)
  })

  it("Should compile scalars.", (done) => {
    const compiler = gqlc({
      Query: { fields: () => ({ value: { resolve () {}} }) },
      Number: {
        serialize (number) {
          return parseFloat(number)
        }
      }
    })
    compiler
    .compile(`scalar Number
             type Query { value: String }`)
    .then((schema) => {
      assert(compiler.scalars.Number)
      done()
    })
    .catch(done)
  })

  it("Should compile interfaces.", (done) => {
    const compiler = gqlc({
      Query: { fields: () => ({ value: { resolve () {}} }) },
      A: { resolveType () { } },
      B: { resolveType () { } },
    })
    compiler
    .compile(`interface A { }
             interface B { }
             type C implements A { }
             type D implements B { }
             type Query { value: String}`)
    .then((schema) => {
      assert(compiler.interfaces.A)
      assert(compiler.interfaces.B)
      const Atypes = compiler.interfaces.A.getPossibleTypes()
      const Btypes = compiler.interfaces.B.getPossibleTypes()
      assert('C' == Atypes[0].name)
      assert('D' == Btypes[0].name)
      done()
    })
    .catch(done)
  })

  it("Should compile type extensions.", (done) => {
    const compiler = gqlc({
      Query: { fields: () => ({ value: { resolve () {}} }) }
    })
    compiler
    .compile(`type Foo {}
             extend type Foo { value: String }
             type Query { value: String}`)
    .then((schema) => {
      assert(compiler.types.Foo)
      assert(compiler.extensions.Foo)
      done()
    })
    .catch(done)
  })

  it("Should compile a schema that can be queried.", (done) => {
    const animals = [
      {gender: 'male', type: 'kinkajou'},
      {gender: 'male', type: 'monkey'},
      {gender: 'female', type: 'dog'},
      {gender: 'female', type: 'cat'},
    ]

    const compiler = gqlc({
      Query: {
        fields: () => ({
          animal: {
            resolve (_, args) {
              const results = animals
              .filter(animal => {
                return Object
                .keys(args)
                .every(key => animal[key] == args[key])
              })

              return results
            }
          }
        })
      },
    })

    compiler
    .compile(`
      type Animal { gender: String!  type: String!  }
      type Query {
        animal (type: String, gender: String): [Animal]
      }
    `)
    .then(schema => {
      assert(schema)
      assert(schema instanceof GraphQLSchema)
      return graphql(schema, `
        query {
          animals: animal(gender: "female") { type }
        }
      `)
    })
    .then(results => {
      assert(results)
      assert(results.data)
      assert(results.data.animals)
      assert(results.data.animals.every(result => {
        const expected = ['dog', 'cat']
        if (expected.indexOf(result.type) > -1) {
          return true
        }
        return false
      }))
      done()
    })
    .catch(done)
  })
})
