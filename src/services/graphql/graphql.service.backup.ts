import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Graphql } from './graphql.class'
import { ApolloServer } from 'apollo-server-express'
// @ts-lint
import { generateSchema } from 'graphql-sequelize-generator'
import { Sequelize } from 'sequelize'
import { GraphQLSchema } from 'graphql'

// @ts-ignore
import seederConfig from '../../seeder-config'
// @ts-ignore
import seeder from 'feathers-seeder'

declare module '../../declarations' {
  interface ServiceTypes {
    'graphql': Graphql & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const models = sequelizeClient.models

  Object.keys(models).forEach((name) => {
    if ('associate' in models[name]) {
      (models[name] as any).associate(models)
    }
  })
  // Sync to the database
  app.set('sequelizeSync', sequelizeClient.sync({ force: (process.env.FORCE_DB_REFRESH === 'true') }).then(() => {
    // @ts-ignore
    app.configure(seeder(seederConfig)).seed()
  }).catch(error => {
    console.log(error)
  })
  )
  const server = new ApolloServer({
    schema: new GraphQLSchema(generateSchema(models)),
    playground: {
      endpoint: '/graphql',
      settings: {
        'editor.theme': 'dark'
      }
    },
    subscriptions: {
      path: '/graphql',
      onConnect: async (connectionParams: any, webSocket: any) => {
        console.log(webSocket)
        return true
      }
    },
    context: ({ req }: any) => ({
      provider: req.feathers.provider,
      headers: req.headers,
      app
    }),
    tracing: true,
    introspection: true
  })
  server.applyMiddleware({ app })

  app.service('graphql')
}
