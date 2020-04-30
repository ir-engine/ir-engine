import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql/type'
import { TypeComposer, InputTypeComposer } from 'graphql-compose'
// @ts-ignore
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date'
// @ts-ignore
import graphqlFields from 'graphql-fields'
import sequelize from 'sequelize'

/**
 * Get output fields from GraphQL AST
 * @param {Object} info GraphQL info resolver arg
 * @param {String} key Optional key for change level
 * @returns {Array} List of fields
 */
export const parseOutpuFields = (info: any, key = null): any => {
  let outputFields = graphqlFields(info)
  if (key) outputFields = outputFields[key]
  return Object.keys(outputFields).reduce((fields: any, field: any) => {
    if (Object.keys(outputFields[field]).length === 0) {
      fields.push(field)
    }
    return fields
  }, [])
}

/**
 * Get output fields from GraphQL AST
 * @param {Object} info GraphQL info resolver arg
 * @param {String} key Optional key for change level
 * @returns {Array} List of fields
 */
export const parseAssociationOutpuFields = (info: any, key = null): any => {
  let outputFields = graphqlFields(info)
  if (key) outputFields = outputFields[key]
  return Object.keys(outputFields).reduce((fields: any, field) => {
    if (Object.keys(outputFields[field]).length > 0) {
      fields.push(field)
    }
    return fields
  }, [])
}

/**
 * Get primary key from Sequelize model attributes
 * @param {Object} attributes Sequelize model attributes
 * @returns {String|null} Primary key field name
 */
export const getPrimaryKeyField: any = (attributes: any): any => {
  return Object.keys(attributes).reduce((primaryKey: any, field: any) => {
    if (attributes[field].primaryKey === true) {
      primaryKey = field
    }
    return primaryKey
  }, null)
}

/**
 * Sequelize Model
 * @external "Sequelize.Model"
 * @see http://docs.sequelizejs.com/class/lib/model.js~Model.html
 */
/**
 * Get attributes selected from info resolve argument
 * @param {@external:"Sequelize.Model"} Model
 * @param {Object} info GraphQL info resolver arg
 * @param {String} key Optional key for change level
 * @returns {Array<String>} List of attributes
 */
export const getFilterAttributes = (Model: any, info: any, key = null): any => {
  const primaryKeyField = getPrimaryKeyField(Model.rawAttributes)
  const attributes = parseOutpuFields(info, key)
  if (!attributes.includes(primaryKeyField)) attributes.push(primaryKeyField)
  const associationAttributes = parseAssociationOutpuFields(info, key)
  const associationAttributesMatches = Object.entries(
    Model.associations
  ).reduce((acc: any, [key, association]: any) => {
    if (
      associationAttributes.includes(key) &&
            association.associationType === 'BelongsTo'
    ) {
      acc.push(association.foreignKey)
    }
    return acc
  }, [])
  return [...new Set([...attributes, ...associationAttributesMatches])]
}

/**
 * Convert input args to Sequelize query options
 * @param {Array<String>} attributes List of model attributes name
 * @param {Object} args Args from revolver
 * @returns {Object} Where filter
 */
export const parseQueryOptions = (attributes: any, args: any): any => {
  const options: any = {}
  const where = attributes.reduce((acc: any, field: any) => {
    if (args.filter) {
      if (typeof args.filter.OR !== 'undefined') {
        acc[sequelize.Op.or] = parseQueryOptions(
          attributes,
          args.filter.OR.reduce(
            (acc: any, curr: any) => {
              Object.assign(acc.filter, curr)
              return acc
            },
            { filter: {} }
          )
        )
      } else if (typeof args.filter.AND !== 'undefined') {
        acc[sequelize.Op.and] = parseQueryOptions(
          attributes,
          args.filter.AND.reduce(
            (acc: any, curr: any) => {
              Object.assign(acc.filter, curr)
              return acc
            },
            { filter: {} }
          )
        )
      } else {
        if (typeof args.filter[field] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.eq] = args.filter[field]
        }
        if (typeof args.filter[field.concat('_not')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.ne] = args.filter[field.concat('_not')]
        }
        if (typeof args.filter[field.concat('_in')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.in] = args.filter[field.concat('_in')]
        }
        if (typeof args.filter[field.concat('_nin')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.notIn] = args.filter[field.concat('_nin')]
        }
        if (typeof args.filter[field.concat('_lt')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.lt] = args.filter[field.concat('_lt')]
        }
        if (typeof args.filter[field.concat('_gt')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.gt] = args.filter[field.concat('_gt')]
        }
        if (typeof args.filter[field.concat('_lte')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.lte] = args.filter[field.concat('_lte')]
        }
        if (typeof args.filter[field.concat('_gte')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.gte] = args.filter[field.concat('_gte')]
        }
        if (typeof args.filter[field.concat('_contains')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.like] = '%'.concat(args.filter[field.concat('_contains')]).concat('%')
        }
        if (typeof args.filter[field.concat('_not_contains')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.notLike] =
                        '%'.concat(args.filter[field.concat('_not_contains')]).concat('%')
        }
        if (typeof args.filter[field.concat('_starts_with')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.like] = args.filter[field.concat('_starts_with')].concat('%')
        }
        if (typeof args.filter[field.concat('_not_starts_with')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.notLike] = '%'.concat(args.filter[field.concat('_not_starts_with')])
        }
        if (typeof args.filter[field.concat('_ends_with')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.like] = '%'.concat(args.filter[field.concat('_ends_with')])
        }
        if (typeof args.filter[field.concat('_not_ends_with')] !== 'undefined') {
          if (!acc[field]) acc[field] = {}
          acc[field][sequelize.Op.notLike] = '%'.concat(args.filter[field.concat('_not_ends_with')])
        }
      }
    }
    return acc
  }, {})
  if (args.orderBy) {
    const match: any = /^(\w+)_(ASC|DESC)$/.exec(args.orderBy)
    if (match.length === 3 && attributes.includes(match[1])) {
      options.order = [[match[1], match[2]]]
    }
  }
  options.where = where
  return options
}

/**
 * @typedef PaginationFields
 * @property {Number} limit
 * @property {Number} offset
 */
/**
 * Parse paginate fields from args
 * @param {Object} args Args from revolver
 * @returns {PaginationFields}
 */
export const parsePagination: any = (args: any): any => {
  const page = args.page || 1
  const paginate = args.paginate || 25
  const limit = paginate
  const offset = paginate * (page - 1)
  return { limit, offset }
}

/**
 * Sequelize Model
 * @external "Sequelize.Model"
 * @see http://docs.sequelizejs.com/class/lib/model.js~Model.html
 */
/**
 * Get filter docs from a model
 * @param {@external:"Sequelize.Model"} Model
 * @param {Object} args Args from revolver
 * @param {Object} where Extra query filter
 * @returns {Array} List of docs
 */
export const findAll = async (Model: any, args: any, info: any, where: any = {}): Promise<any> => {
  const options = parseQueryOptions(Object.keys(Model.rawAttributes), args)
  const { limit, offset } = parsePagination(args)
  options.limit = limit
  options.offset = offset
  options.attributes = getFilterAttributes(Model, info)
  Object.keys(where).forEach(key => {
    if (typeof options.where[key] === 'undefined') {
      options.where[key] = where[key]
    } else {
      Object.assign(options.where[key], where[key])
    }
  })
  const docs = await Model.findAll(options)
  return docs
}

/**
 * GraphQLEnumType
 * @external "GraphQLEnumType"
 * @see https://graphql.org/graphql-js/type/#graphqlenumtype
 */
/**
 * Create orderBy EnumType
 * @param {Object} rawAttributes Sequelize model attributes
 * @param {Srting} name
 * @returns {@external:"GraphQLEnumType"}
 */
export const createOrderBy = (rawAttributes: any, name: any): any => {
  const values = Object.keys(rawAttributes).reduce((acc: any, field: any) => {
    acc[field.concat('_ASC')] = { value: field.concat('_ASC') }
    acc[field.concat('_DESC')] = { value: field.concat('_DESC') }
    return acc
  }, {})
  return new GraphQLEnumType({
    name: name.concat('OrderBy'),
    description: 'Order by any model field',
    values: values
  })
}

/**
 * Get models attributes from graphql input args
 * @param {Array<String>} attributes List of model attributes name
 * @param {Object} args Args from revolver
 * @returns {Object} Model attributes with values
 */
export const getFields = (attributes: any, args: any): any => {
  return attributes.reduce((acc: any, field: any) => {
    if (typeof args[field] !== 'undefined') {
      acc[field] = args[field]
    }
    return acc
  }, {})
}

/**
 * Sequelize Model
 * @external "Sequelize.Model"
 * @see http://docs.sequelizejs.com/class/lib/model.js~Model.html
 */
/**
 * Create generic query resolvers (findAll and findOne)
 * @param {@external:"Sequelize.Model"} Model
 * @returns {Object} Object with findAll and findOne resolvers
 */
export const createQueryResolvers = (Model: any): any => {
  return {
    findAll: async (root: any, args: any, ctx: any, info: any) => {
      const docs = await findAll(Model, args, info)
      return docs
    },
    findOne: async (root: any, args: any, ctx: any, info: any) => {
      const options: any = {
        where: {
          id: args.id
        },
        attributes: null
      }
      options.attributes = getFilterAttributes(Model, info)
      const doc = await Model.findOne(options)
      return doc
    }
  }
}

/**
 * Sequelize Model
 * @external "Sequelize.Model"
 * @see http://docs.sequelizejs.com/class/lib/model.js~Model.html
 */
/**
 * Create generic mutation resolvers (create, update y delete)
 * @param {@external:"Sequelize.Model"} Model
 * @returns {Object} Object with create, update y delete resolvers
 */
export const createMutationResolvers = (Model: any): any => {
  return {
    create: async (root: any, args: any) => {
      const data = getFields(Object.keys(Model.rawAttributes), args)
      const doc = await Model.create(data)
      return doc
    },
    update: async (root: any, args: any) => {
      const doc = await Model.findOne({
        where: {
          id: args.id
        }
      })
      const data = getFields(Object.keys(Model.rawAttributes), args)
      await doc.update(data)
      return doc
    },
    delete: async (root: any, args: any) => {
      const doc = await Model.findOne({
        where: {
          id: args.id
        }
      })
      const result = await Model.softDelete({
        where: {
          id: args.id
        }
      })
      return result > 0 ? doc : null
    }
  }
}

/**
 * GraphQLScalarType
 * @external "GraphQLScalarType"
 * @see https://graphql.org/graphql-js/type/#graphqlscalartype
 */
/**
 * Convert Sequelize attibute type to GraphQL type
 * @param {String} type
 * @returns {@external:"GraphQLScalarType"} GraphQLScalarType
 */
export const sequelizeTypeToGraphQLType = (type: any): any => {
  const attributes: any = {
    BOOLEAN: GraphQLBoolean,
    FLOAT: GraphQLFloat,
    DOUBLE: GraphQLFloat,
    'DOUBLE PRECISION': GraphQLFloat,
    INTEGER: GraphQLInt,
    CHAR: GraphQLString,
    STRING: GraphQLString,
    TEXT: GraphQLString,
    UUID: GraphQLString,
    DATE: GraphQLDateTime,
    DATEONLY: GraphQLDate,
    TIME: GraphQLString,
    BIGINT: GraphQLString,
    DECIMAL: GraphQLString,
    VIRTUAL: GraphQLString
  }

  return attributes[type]
}

/**
 * @typedef FieldOptions
 * @property {Boolean} allowNull Remove GraphQLNonNull constraint
 * @property {Array<String>} ignore List of fields to ignore
 */
/**
 * Convert model attributes to graphql input fields
 * @param {Object} rawAttributes Sequelize model attributes
 * @param {FieldOptions} options Fields options
 * @returns {Object}
 */
export const modelAttributesToGraphQLFields = (rawAttributes: any, options: any = {}): any => {
  const { allowNull = false, ignore = [] } = options
  return Object.keys(rawAttributes).reduce((acc: any, key) => {
    if (!ignore.includes(key)) {
      const attribute = rawAttributes[key]
      const type = attribute.type
      acc[key] = {
        type: sequelizeTypeToGraphQLType(type.key)
      }
      if (!allowNull) {
        if (attribute.allowNull === false || attribute.primaryKey === true) {
          acc[key].type = new GraphQLNonNull(acc[key].type)
        }
      }
      if (typeof attribute.comment === 'string') {
        acc[key].description = attribute.comment
      }
    }
    return acc
  }, {})
}

/**
 * Create input query filters from model attribute
 * @param {Object} attribute Sequelize model attribute
 * @returns {Object} Object with query filters
 */
export const attributeToFilters = (attribute: any): object => {
  const booleanFilters = {
    [attribute.fieldName]: {
      type: GraphQLBoolean
    },
    [attribute.fieldName.concat('_not')]: {
      type: GraphQLBoolean,
      description: 'All values that are not equal to given value.'
    }
  }
  const numberFilters = {
    [attribute.fieldName]: {
      type: GraphQLInt
    },
    [attribute.fieldName.concat('_not')]: {
      type: GraphQLInt,
      description: 'All values that are not equal to given value.'
    },
    [attribute.fieldName.concat('_in')]: {
      type: new GraphQLList(GraphQLInt),
      description: 'All values that are contained in given list.'
    },
    [attribute.fieldName.concat('_in')]: {
      type: new GraphQLList(GraphQLInt),
      description: 'All values that are not contained in given list.'
    },
    [attribute.fieldName.concat('_lt')]: {
      type: GraphQLInt,
      description: 'All values less than the given value.'
    },
    [attribute.fieldName.concat('_gt')]: {
      type: GraphQLInt,
      description: 'All values greater than the given value.'
    },
    [attribute.fieldName.concat('_lte')]: {
      type: GraphQLInt,
      description: 'All values less than or equal the given value.'
    },
    [attribute.fieldName.concat('_gte')]: {
      type: GraphQLInt,
      description: 'All values greater than or equal the given value.'
    }
  }
  const stringFilters = {
    [attribute.fieldName]: {
      type: GraphQLString
    },
    [attribute.fieldName.concat('_not')]: {
      type: GraphQLString,
      description: 'All values that are not equal to given value.'
    },
    [attribute.fieldName.concat('_in')]: {
      type: new GraphQLList(GraphQLString),
      description: 'All values that are contained in given list.'
    },
    [attribute.fieldName.concat('_not_in')]: {
      type: new GraphQLList(GraphQLString),
      description: 'All values that are not contained in given list.'
    },
    [attribute.fieldName.concat('_contains')]: {
      type: GraphQLString,
      description: 'All values containing the given string.'
    },
    [attribute.fieldName.concat('_not_contains')]: {
      type: GraphQLString,
      description: 'All values not containing the given string.'
    },
    [attribute.fieldName.concat('_starts_with')]: {
      type: GraphQLString,
      description: 'All values starting with the given string.'
    },
    [attribute.fieldName.concat('_ends_with')]: {
      type: GraphQLString,
      description: 'All values ending with the given string.'
    },
    [attribute.fieldName.concat('_not_starts_with')]: {
      type: GraphQLString,
      description: 'All values not starting with the given string.'
    },
    [attribute.fieldName.concat('_not_ends_with')]: {
      type: GraphQLString,
      description: 'All values not ending with the given string.'
    }
  }
  const attributes: any = {
    BOOLEAN: booleanFilters,
    FLOAT: numberFilters,
    DOUBLE: numberFilters,
    'DOUBLE PRECISION': numberFilters,
    INTEGER: numberFilters,
    CHAR: stringFilters,
    STRING: stringFilters,
    TEXT: stringFilters,
    UUID: stringFilters,
    DATE: stringFilters,
    DATEONLY: stringFilters,
    TIME: stringFilters,
    BIGINT: stringFilters,
    DECIMAL: stringFilters
  }
  return attributes[attribute.type.key]
}

/**
 * Create input query filters from all model attributes
 * @param {Object} rawAttributes Sequelize model attributes
 * @returns {Object} Input query fields
 */
export const createInputQueryFilters = (attributes: any): any => {
  return Object.keys(attributes).reduce((fields, attibute) => {
    const attribute = attributes[attibute]
    Object.assign(fields, attributeToFilters(attribute))
    return fields
  }, {})
}

// Pagination fields to input query
export const paginationFields = {
  page: {
    type: GraphQLInt,
    description: 'Set number page for pagination'
  },
  paginate: {
    type: GraphQLInt,
    description: 'Set number of elements per page for pagination'
  }
}

/**
 * Create generic input args (filter, orderBy, page, paginate)
 * @param {Object} rawAttributes Sequelize model attributes
 * @param {String} name Name for filter and order input types
 * @returns {Object} Object with filter, orderBy, page, paginate
 */
export const createQueryArgs = (attributes: any, name: any): any => {
  const filter = InputTypeComposer.create({
    name: name.concat('Filter'),
    fields: createInputQueryFilters(attributes)
  })
  filter.addFields({
    OR: [filter],
    AND: [filter]
  })
  return {
    filter: {
      type: filter.gqType,
      description: 'Filter query parameters'
    },
    orderBy: {
      type: createOrderBy(attributes, name),
      description: 'Set order by any model attribute'
    },
    ...paginationFields
  }
}

/**
 * @typedef FieldOptions
 * @property {Boolean} allowNull Remove GraphQLNonNull constraint
 * @property {Array<String>} ignore List of fields to ignore
 */
/**
 * TypeComposer
 * @external "graphql-compose.TypeComposer"
 * @see https://github.com/graphql-compose/graphql-compose/tree/master/docs/04-api-reference#typecomposer
 */
/**
 * Create GraphQL Type from Sequelize Model
 * @param {String} name Model name
 * @param {Object} rawAttributes Sequelize model attributes
 * @param {FieldOptions} options Field options
 * @returns {@external:"graphql-compose.TypeComposer"}
 */
export const modelToType = (name: any, rawAttributes: any, options: any): any => {
  return TypeComposer.create(
    new GraphQLObjectType({
      name: name,
      fields: modelAttributesToGraphQLFields(rawAttributes, options)
    })
  )
}

/**
 * @typedef TypeOptions
 * @property {Array<String>} ignore List of models name to ignore
 * @property {Object} fields Field options by Model
 */
/**
 * Create all GraphQL Type from a list of Sequelize Model
 * @param {Object} models Sequelize instance with models
 * @param {TypeOptions} options Type options
 * @returns {Object} Object with all GraphQL types from models
 */
export const createTypes = (models: any, options: any = {}): any => {
  const { ignore = [], fields = {} } = options
  return Object.keys(models).reduce((types: any, name) => {
    if (
      models[name].prototype instanceof sequelize.Model &&
            !ignore.includes(name)
    ) {
      types[name] = modelToType(
        models[name].name,
        models[name].rawAttributes,
        fields[name] || {}
      )
    }
    return types
  }, {})
}

/**
 * Add model relation fields
 * @param {Object} types All graphql types from models
 * @param {String} name Model Type name
 * @param {Object} associations Model relations
 */
export const appendAssociations = (types: any, name: any, associations: any): any => {
  const _associations = Object.entries(associations)
  if (_associations.length > 0) {
    const associationFields = _associations.reduce(
      (fields: any, [key, association]: any) => {
        try {
          if (association.associationType === 'HasMany') {
            fields[key] = {
              type: new GraphQLList(types[association.target.name].gqType),
              args: createQueryArgs(
                association.target.rawAttributes, association.source.name.concat(key)
              ),
              resolve: async (parent: any, args: any, ctx: any, info: any) => {
                const options = parseQueryOptions(
                  Object.keys(association.target.rawAttributes),
                  args
                )
                const { limit, offset } = parsePagination(args)
                options.limit = limit
                options.offset = offset
                options.attributes = getFilterAttributes(
                  association.target,
                  info
                )
                if (!options.attributes.includes(association.foreignKey)) {
                  options.attributes.push(association.foreignKey)
                }
                const docs = await parent[association.accessors.get](options)
                return docs
              }
            }
          } else if (association.associationType === 'BelongsTo') {
            fields[key] = {
              type: types[association.target.name].gqType,
              args: createQueryArgs(
                association.target.rawAttributes, association.source.name.concat(key)
              ),
              resolve: async (parent: any, args: any, ctx: any, info: any) => {
                const options: any = {}
                options.attributes = getFilterAttributes(
                  association.target,
                  info
                )
                const docs = await parent[association.accessors.get](options)
                return docs
              }
            }
          } else if (association.associationType === 'BelongsToMany') {
            fields[key] = {
              type: new GraphQLList(types[association.target.name].gqType),
              args: createQueryArgs(
                association.target.rawAttributes, association.source.name.concat(key)
              ),
              resolve: async (parent: any, args: any, ctx: any, info: any) => {
                const options = parseQueryOptions(
                  Object.keys(association.target.rawAttributes),
                  args
                )
                const { limit, offset } = parsePagination(args)
                options.limit = limit
                options.offset = offset
                options.attributes = getFilterAttributes(
                  association.target,
                  info
                )
                const docs = await parent[association.accessors.get](options)
                return docs
              }
            }
          }
        } catch (err) { }
        return fields
      },
      {}
    )
    types[name].addFields(associationFields)
  }
}
