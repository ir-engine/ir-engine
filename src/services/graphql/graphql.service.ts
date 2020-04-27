import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Graphql } from './graphql.class'
import { ApolloServer, gql } from 'apollo-server-express'

import Resolver from './resolver'
import Schema from './schema'

declare module '../../declarations' {
  interface ServiceTypes {
    'graphql': Graphql & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const schema = new ApolloServer({
    typeDefs: Schema,
    resolvers: new Resolver(app).resolve(),
    playground: {
      endpoint: '/graphql',
      settings: {
        'editor.theme': 'dark'
      }
    }
  });

  schema.applyMiddleware({
    app
  })

  app.service('graphql')
}
