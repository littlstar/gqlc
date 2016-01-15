'use strict'

/**
 * Module dependencies.
 */

import invariant from 'invariant'
import extend from 'extend'

/**
 * GraphQL dependencies.
 */

import * as language from 'graphql/language'
import {
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInt,
  GraphQLID
} from 'graphql'

/**
 * Pick first value from n objects.
 *
 * @private
 * @param {String} key
 * @param {...Mixed} objects
 * @return {Mixed}
 */

function pick (key, ...objects) {
  for (let object of objects)
    if (undefined !== object[key])
      return object[key]
  return undefined
}

/**
 * Extend a given field map with an
 * implementation field spec.
 *
 * @private
 * @param {Object} implementation
 * @param {Object} map
 * @return {Object}
 */

function inheritSpecFields (implementation, map = {}) {
  if (implementation) {
    extend(true, map,
           'function' == typeof implementation.fields ?
             implementation.fields() :
             implementation.fields)
  }

  return map
}

/**
 * Extend a spec with an implementation spec.
 *
 * @private
 * @param {Object} implementation
 * @param {Object} spec
 * @return {Object}
 */

function inheritSpec (implementation, spec = {}) {
  if (implementation) {
    extend(true, spec,
           'function' == typeof implementation ?
             implementation() :
             implementation)
  }

  return spec
}

/**
 * Global parser types.
 *
 * @public
 * @const
 * @type {Object}
 */

export const Types = {
  'NonNullType': GraphQLNonNull,
  'ListType': GraphQLList,
  'Boolean': GraphQLBoolean,
  'String': GraphQLString,
  'Float': GraphQLFloat,
  'Int': GraphQLInt,
  'ID': GraphQLID
}

/**
 * Global interface types.
 *
 * @public
 * @const
 * @type {Object}
 */

export const Interfaces = { }

/**
 * Global enum types.
 *
 * @public
 * @const
 * @type {Object}
 */

export const Enums = { }

/**
 * Global union types.
 *
 * @public
 * @const
 * @type {Object}
 */

export const Unions = { }

/**
 * Global scalar types.
 *
 * @public
 * @const
 * @type {Object}
 */

export const Scalars = { }

/**
 * Default query type for schema
 *
 * @public
 * @const
 * @type {String}
 */

export const DEFAULT_QUERY_TYPE = 'Query'

/**
 * Default mutation type for schema
 *
 * @public
 * @const
 * @type {String}
 */

export const DEFAULT_MUTATION_TYPE = 'Mutation'

/**
 * Creates a GQL Compiler instance.
 *
 * @public
 * @param {?(Object)} state
 * @param {?(Object)} state.specs
 * @param {?(Object)} state.types
 * @param {?(Object)} state.enums
 * @param {?(Object)} state.interfaces
 * @param {Object} implementation
 * @return {Compiler}
 */

export default function gqlc (...args) {
  if (1 == args.length)
    return new Compiler({}, args[0])
  else return new Compiler(...args)
}

/**
 * Compiler class.
 *
 * @public
 */

export class Compiler {

  /**
   * Compiler constructor.
   *
   * @constructor
   * @param {?(Object)} state
   * @param {?(Object)} state.specs
   * @param {?(Object)} state.types
   * @param {?(Object)} state.enums
   * @param {?(Object)} state.unions
   * @param {?(Object)} state.inputs
   * @param {?(Object)} state.scalars
   * @param {?(Object)} state.interfaces
   * @param {Object} implementation
   */

  constructor ({specs = {},
               types = {},
               enums = {},
               unions = {},
               inputs = {},
               scalars = {},
               interfaces = {},
               extensions = {}} = {},
               implementation) {

    /**
     * GraphQL schema object definitions.
     *
     * @type {Object}
     */

    this.specs = specs

    /**
     * GraphQL schema types instances.
     *
     * @type {Object}
     */

    this.types = types

    /**
     * GraphQL schema enum instances.
     *
     * @type {Object}
     */

    this.enums = enums

    /**
     * GraphQL schema union instances.
     *
     * @type {Object}
     */

    this.unions = unions

    /**
     * GraphQL schema input instances.
     *
     * @type {Object}
     */

    this.inputs = inputs

    /**
     * GraphQL schema scalar instances.
     *
     * @type {Object}
     */

    this.scalars = scalars

    /**
     * GraphQL schema interface instances.
     *
     * @type {Object}
     */

    this.interfaces = interfaces

    /**
     * GraphQL schema type extensions.
     *
     * @type {Object}
     */

    this.extensions = extensions

    /**
     * GraphQL schema implementations
     *
     * @type {Object}
     */

    this.implementation = implementation
    invariant('object' == typeof this.implementation,
              "GQL Compiler expects an implementation object.")
  }

  /**
   * Parses source adding to the internal
   * schema fields.
   *
   * @public
   * @param {?(String)} source
   * @param {Object} [opts]
   * @return {Promise}
   */

  compile (source = null, {
    filename = null,
    main = {query: DEFAULT_QUERY_TYPE,
            mutation: DEFAULT_MUTATION_TYPE
           }} = {}) {

    const self = this

    return new Promise((resolve, reject) => {
      const interfaces = this.interfaces
      const schema = { query: null, mutatation: null }
      const types = this.types

      if ('string' == typeof source) {
        source = source.trim()
      }

      // parse new source if given
      if (source) {
        source = new language.Source(source, filename)
        walk(language.parse(source))
      }

      // create root query
      if (main.query && self.specs[main.query]) {
        schema.query = new GraphQLObjectType(self.specs[main.query])
      }

      // create root mutation
      if (main.mutation && self.specs[main.mutation]) {
        schema.mutation = new GraphQLObjectType(self.specs[main.mutation])
      }

      resolve(new GraphQLSchema(schema))

      function walk (node) {
        switch (node.kind) {
          case 'Document':
            for (let definition of node.definitions)
              walk(definition)
            break

          case 'InterfaceTypeDefinition':
            self._createGraphQLObjectTypeDefinitionFromNode('interface', node)
            break

          case 'ObjectTypeDefinition':
            self._createGraphQLObjectTypeDefinitionFromNode('object', node)
            break

          case 'EnumTypeDefinition':
            self._createGraphQLEnumDefinitionFromNode(node)
            break

          case 'UnionTypeDefinition':
            self._createGraphQLUnionDefinitionFromNode(node)
            break

          case 'InputObjectTypeDefinition':
            self._createGraphQLObjectTypeDefinitionFromNode('input', node)

            break
          case 'ScalarTypeDefinition':
            self._createGraphQLObjectTypeDefinitionFromNode('scalar', node)
            break

          case 'TypeExtensionDefinition':
            self._createGraphQLObjectTypeDefinitionFromNode('object', node.definition, true)
            break

          default:
        }
      }
    })
  }

  /**
   * Parses node into a type or interface object definition
   * and sets it on the parser instance.
   *
   * @private
   * @param {String} type
   * @param {Object} node
   * @param {Boolean} [extendType = false]
   */

  _createGraphQLObjectTypeDefinitionFromNode (type, node, extendType = false) {
    const self = this
    const name = node.name.value
    const implementation = this.implementation[name]
    const spec = (
      true === extendType && 'object' == typeof this.specs[name] ?
      this.specs[name] :
      { name, fields, interfaces: [] }
    )

    if (implementation && 'object' == typeof implementation) {
      for (let key in implementation) {
        if (null == spec[key])
          spec[key] = implementation[key]
      }
    }

    this.specs[name] = spec

    switch (type) {
      case 'interface':
        this.interfaces[name] = new GraphQLInterfaceType(spec)
        this.types[name] = this.interfaces[name]
        break

      case 'object':
        if (node.interfaces && node.interfaces.length) {
          for (let I of node.interfaces) {
            const C = pick(I.name.value, this.interfaces, Interfaces)
            if (-1 == spec.interfaces.indexOf(C)) {
              spec.interfaces.push(C)
            }
          }
        }

        if (true === extendType) {
          this.extensions[name] = {
            fields: node.fields
          }
        }

        // prevent redefinition
        if (null == this.types[name]) {
          this.types[name] = new GraphQLObjectType(spec)
        }
        break

      case 'input':
        this.types[name] = new GraphQLInputObjectType(spec)
        this.inputs[name] = this.types[name]
        break

      case 'scalar':
        // remove fields from scalar types
        delete spec.fields
        this.types[name] = new GraphQLScalarType(spec)
        this.scalars[name] = this.types[name]
        break

      default:
        throw new TypeError(`Unexpected object type definition ${type}`)
    }

    /**
     * Object field definition closure.
     *
     * @private
     * @return {Object}
     */

    function fields () {
      const extensions = self.extensions[name]
      const map = {}

      for (let field of node.fields) {
        self._createGraphQLFieldFromNode(field, map)
      }

      if (extensions && extensions.fields) {
        for (let field of extensions.fields) {
          self._createGraphQLFieldFromNode(field, map)
        }
      }

      if (spec.interfaces) {
        for (let I of spec.interfaces)
          inheritSpecFields(self.implementation[I.name], map)
      }

      inheritSpecFields(self.implementation[name], map)

      return map
    }
  }

  /**
   * Creates an union type from an AST node.
   *
   * @private
   * @param {Object} node
   */

  _createGraphQLUnionDefinitionFromNode (node) {
    const types = node.types.map(type => this._getTypeFromNode(type))
    const name = node.name.value
    const spec = { name, types }
    const self = this
    inheritSpec(this.implementation[name], spec)
    const type = new GraphQLUnionType(spec)
    this.unions[name] = type
    this.types[name] = type
  }

  /**
   * Creates an enum type spec from a node
   * with its respective values.
   *
   * @private
   * @param {Object} node
   */

  _createGraphQLEnumDefinitionFromNode (node) {
    const name = node.name.value
    const type = new GraphQLEnumType({
      name: name,
      values: node.values.reduce((object, field) => {
        object[field.name.value] = { value: field.name.value }
        return object
      }, {})
    })

    this.enums[name] = type
    this.types[name] = type
  }

  /**
   * Creates a GraphQL field object from an
   * AST node
   *
   * @private
   * @param {Object} node
   * @param {Object} out
   */

  _createGraphQLFieldFromNode (node, out) {
    const name = node.name.value
    const args = {}
    const spec = { name, args }

    if (node.arguments && node.arguments.length) {
      for (let arg of node.arguments)
        this._createGraphQLFieldFromNode(arg, args)
    }

    out[name] = spec
    spec.type = this._getTypeFromNode(node)
  }

  /**
   * Derives field contructor type
   * from a value string using the Types
   * mapping.
   *
   * @private
   * @param {Object} node
   * @param {(Boolean)} create
   * @return {Function}
   * @throws TypeError
   */

  _getTypeFromNode (node) {
    const interfaces = extend(true, Interfaces, this.interfaces)
    const unions = extend(true, Unions, this.unions)
    const enums = extend(true, Enums, this.enums)
    const types = extend(true, Types, this.types)
    const self = this
    let Type = null

    if (node.type) {
      if (node.type.type) {
        Type = walk(node)
        function walk (node) {
          if (node.type.type) {
            const id = node.type.name ? node.type.name.value : node.type.kind
            const Parent = pick(id, enums, types, unions)
            const Child = walk(node.type)
            return new Parent(Child)
          } else {
            const id = node.type.name.value
            return pick(id, interfaces, enums, types, unions)
          }
        }
      } else {
        const id = node.type.name.value
        Type = pick(id, interfaces, enums, types, unions)
      }
    } else if (node.kind) {
      const id = node.name.value
      Type = pick(id, interfaces, enums, types, unions)
    }

    return Type
  }
}
