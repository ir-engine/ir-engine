import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Graphql } from './graphql.class';
import { PubSub } from 'graphql-subscriptions';
import { generateModelTypes, generateApolloServer } from 'graphql-sequelize-generator';
import { NotAuthenticated } from '@feathersjs/errors';
import jwt from 'jsonwebtoken';
import config from '../../config';

import { Sequelize } from 'sequelize';
import logger from '../../app/logger';

declare module '../../declarations' {
  interface ServiceTypes {
    'graphql': Graphql & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const models = sequelizeClient.models;
  const types = generateModelTypes(models);

  const pubSubInstance = new PubSub();

  const actions = ['list', 'create', 'read', 'update', 'delete'];

  const graphqlSchemaDeclaration = (): any => {
    const declarations: any[] = [];
    Object.keys(models).forEach((model: any) => {
      declarations.push({ model: model, actions });
    });

    // TO-DO: Move Seqeuelize key assocation somewhere else -- for now it's working here
    Object.keys(models).forEach((name) => {
      if ('associate' in models[name]) {
        (models[name] as any).associate(models);
      }
    });

    const initialValue = {};

    const values = declarations.reduce((obj, item) => {
      return {
        ...obj,
        [sequelizeClient.model(item.model).name]: { model: sequelizeClient.model(item.model), actions }
      };
    }, initialValue);
    return values;
  };

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
      context: async (context: any): Promise<any> => {
        const req = context.req;
        if (context.req && context.req.body && context.req.body.operationName === 'IntrospectionQuery') {
          return;
        }
        if (context.connection && context.connection.context && context.connection.context.user) {
          return {
            user: context.connection.context.user
          };
        }
        const authHeader = req.headers.authorization;
        if (authHeader == null) {
          throw new NotAuthenticated('Missing authorization header');
        }
        const token = authHeader.replace('Bearer ', '');
        try {
          const verify = await jwt.verify(token, config.authentication.secret);
          const identityProvider = await app.service('identity-provider').get((verify as any).sub);
          const user = await app.service('user').get((identityProvider).userId);
          return {
            user: user.dataValues
          };
        } catch (err) {
          logger.error(err);
          throw err;
        }
      },
      subscriptions: {
        path: '/subscriptions',
        onConnect: async (connectionParams: any, webSocket: any): Promise<any> => {
          const authHeader = connectionParams.Authorization || connectionParams.authorization;
          if (authHeader == null) {
            throw new NotAuthenticated('Missing authorization header');
          }
          const token = authHeader.replace('Bearer ', '');
          try {
            const verify = await jwt.verify(token, config.authentication.secret);
            const identityProvider = await app.service('identity-provider').get((verify as any).sub);
            const user = await app.service('user').get((identityProvider).userId);

            return {
              user: user.dataValues
            };
          } catch (err) {
            logger.error(err);
            throw err;
          }
        }
      },
      introspection: true
    },
    pubSubInstance
  });

  server.applyMiddleware({
    app,
    path: '/graphql'
  });

  app.service('graphql');
};
