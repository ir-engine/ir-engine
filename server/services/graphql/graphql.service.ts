import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Graphql } from './graphql.class'
import { PubSub } from 'graphql-subscriptions'
// @ts-ignore
import { generateModelTypes, generateApolloServer } from 'graphql-sequelize-generator'

import { Sequelize } from 'sequelize'

declare module '../../declarations' {
  interface ServiceTypes {
    'graphql': Graphql & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const models = sequelizeClient.models
  const types = generateModelTypes(models)

  const pubSubInstance = new PubSub()

  const actions = ['list', 'create', 'read', 'update', 'delete']

  const graphqlSchemaDeclaration = (): any => {
    const declarations: any[] = []
    Object.keys(models).forEach((model: any) => {
      declarations.push({ model: model, actions })
      console.log(sequelizeClient.modelManager.getModel(model))
    })

    // TO-DO: Move Seqeuelize key assocation somewhere else -- for now it's working here
    Object.keys(models).forEach((name) => {
      if ('associate' in models[name]) {
        (models[name] as any).associate(models)
      }
    })

    const initialValue = {}

    const values = declarations.reduce((obj, item) => {
      return {
        ...obj,
        [sequelizeClient.model(item.model).name]: { model: sequelizeClient.model(item.model), actions }
      }
    }, initialValue)
    return values
  }

  const server = generateApolloServer({
    graphqlSchemaDeclaration: graphqlSchemaDeclaration(),
    types: types,
    models: models,
    apolloServerOptions: {
      playground: {
        endpoint: '/graphql',
        settings: {
          'editor.theme': 'dark'
        }
      },
      subscriptions: {
        path: '/graphql',
        onConnect: async (connectionParams: any, webSocket: any) => {
          console.log(connectionParams)
          console.log(webSocket)
          return true
        }
      },
      introspection: true
    },
    pubSubInstance
  })

  server.applyMiddleware({
    app,
    path: '/graphql'
  })

  app.service('graphql')
}
