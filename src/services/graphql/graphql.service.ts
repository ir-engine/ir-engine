import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Graphql } from './graphql.class'
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

  const actions = ['list', 'create']

  console.log('*********** graphqlSchemaDeclarationNew')
  const graphqlSchemaDeclarationNew =
  {
    user: {
      model: models.user,
      actions: ['list', 'create']
    }
  }
  console.log(graphqlSchemaDeclarationNew)

  const graphqlSchemaDeclaration = (): any => {
    const declarations: any[] = []
    Object.keys(models).forEach((model: any) => {
      declarations.push({ model: model, actions })
    })

    const initialValue = {}

    const values = declarations.reduce((obj, item) => {
      return {
        ...obj,
        [sequelizeClient.model(item.model).name]: { model: sequelizeClient.model(item.model), actions }
      }
    }, initialValue)
    console.log('*********** values')

    console.log(values)
    return values
  }

  graphqlSchemaDeclaration()

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
      context: ({ req }: any) => ({
        provider: req.feathers.provider,
        headers: req.headers,
        app
      }),
      introspection: true
    }
  })

  server.applyMiddleware({
    app,
    path: '/graphql'
  })

  server.applyMiddleware({
    app
  })

  app.service('graphql')
}
