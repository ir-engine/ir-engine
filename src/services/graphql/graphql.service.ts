import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Graphql } from './graphql.class'
import { PubSub } from 'graphql-subscriptions'
// @ts-ignore
import { generateModelTypes, generateApolloServer } from 'graphql-sequelize-generator'
import InstanceType from './instance/instance-type'
import fs from 'fs'

import { Sequelize } from 'sequelize'
// @ts-ignore
import AgonesSDK from '@google-cloud/agones-sdk'

const typeRe = /([a-zA-Z]+).instance/
const realtimeTypeFilenames = fs.readdirSync('./src/services/graphql/instance/instance-types')
const realtimeTypes = realtimeTypeFilenames.map((name: string) => {
  const match = name.match(typeRe)
  return match != null ? match[1] : 'ignore'
})

declare module '../../declarations' {
  interface ServiceTypes {
    'graphql': Graphql & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  let agonesSDK: AgonesSDK
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const models = sequelizeClient.models
  const types = generateModelTypes(models)

  const pubSubInstance = new PubSub()

  const actions = ['list', 'create', 'read', 'update', 'delete']

  if (process.env.SERVER_MODE === 'realtime' && process.env.KUBERNETES === 'true') {
    agonesSDK = new AgonesSDK()
    agonesSDK.connect()
    agonesSDK.ready()
    healthPing(agonesSDK)
  }

  const graphqlSchemaDeclaration = (): any => {
    const declarations: any[] = []
    Object.keys(models).forEach((model: any) => {
      const options = {
        model: model,
        actions: actions,
        additionalMutations: {},
        additionalSubscriptions: {}
      }

      if (process.env.SERVER_MODE === 'realtime' && realtimeTypes.includes(model)) {
        const instance = new InstanceType(model, models[model], app.service('realtime-store'), pubSubInstance, agonesSDK)
        options.additionalMutations = instance.mutations
        options.additionalSubscriptions = instance.subscriptions
      }
      declarations.push(options)
      console.log(sequelizeClient.modelManager.getModel(model))
    })

    // TO-DO: Move Seqeuelize key association somewhere else -- for now it's working here
    Object.keys(models).forEach((name) => {
      if ('associate' in models[name]) {
        (models[name] as any).associate(models)
      }
    })

    const initialValue = {}

    const values = declarations.reduce((obj, item) => {
      return {
        ...obj,
        [sequelizeClient.model(item.model).name]: {
          model: sequelizeClient.model(item.model),
          actions: actions,
          additionalMutations: item.additionalMutations,
          additionalSubscriptions: item.additionalSubscriptions
        }
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
        path: '/subscriptions',
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

  ;(app as any).apolloServer = server

  app.service('graphql')
}

function healthPing (agonesSDK: AgonesSDK): void {
  agonesSDK.health()
  setTimeout(() => healthPing(agonesSDK), 1000)
}
