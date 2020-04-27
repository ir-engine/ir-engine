import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Graphql } from './graphql.class'
import { GraphQLObjectType, GraphQLList, GraphQLSchema, GraphQLInt } from 'graphql'
// @ts-ignore
import graphqlSequelize from 'graphql-sequelize'
import GraphHTTP from 'express-graphql'
import _ from 'lodash'
import { Sequelize } from 'sequelize'
import camelCase from 'camelcase'

declare module '../../declarations' {
  interface ServiceTypes {
    'graphql': Graphql & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')

  const models = sequelizeClient.models

  const getFields = (params: any): any => {
    return _.assign(
      graphqlSequelize.attributeFields(
        params.model,
        Object.assign(params.options || {}, {
          map: (k: any) => camelCase(k)
        })
      ),
      params.additionalFields || {}
    )
  }

  const fields = _(models).map((model, key) => {
    return {
      fieldName: _.lowerFirst(key.toString()) + 's',
      type: new GraphQLList(new GraphQLObjectType({
        name: key.toString(),
        fields: () => getFields({ model: model })
      })),
      args: {
        id: { type: GraphQLInt },
        limit: { type: GraphQLInt }
      },
      resolve: function (root: any, args: any, _: any, info: any) {
        // Until graphql-sequelize is updated
        return graphqlSequelize.resolver(model)(root, args, info)
      }
    }
  })
    .keyBy('fieldName')
    .value()

  const Query = new GraphQLObjectType({
    name: 'Query',
    description: 'This is a root query.',
    fields: () => fields
  })

  const Schema = new GraphQLSchema({
    query: Query
  })

  app.use('/graphql', GraphHTTP({
    schema: Schema,
    pretty: true,
    graphiql: true
  }))

  app.service('graphql')
}
