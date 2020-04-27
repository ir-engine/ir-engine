import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Graphql } from './graphql.class'
import { GraphQLObjectType, GraphQLList, GraphQLSchema, GraphQLInt } from 'graphql'
import { ApolloServer } from 'apollo-server-express'
// @ts-ignore
import graphqlSequelize from 'graphql-sequelize'
import util from 'util'
import camelCase from 'camelcase'

import _ from 'lodash'
import { Sequelize } from 'sequelize'

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
        console.log(root)
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

  console.log(util.inspect(Schema, { showHidden: false, depth: null }))

  const server = new ApolloServer({
    schema: Schema,
    playground: {
      endpoint: '/graphql',
      settings: {
        'editor.theme': 'dark'
      }
    },
    context: ({ req }: any) => ({
      provider: req.feathers.provider,
      headers: req.headers,
      app
    }),
    introspection: true
  }
  )

  server.applyMiddleware({
    app
  })

  app.service('graphql')
}
