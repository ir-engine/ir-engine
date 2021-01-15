import * as authentication from '@feathersjs/authentication';
import addAssociations from '../../hooks/add-associations';
import { HookContext } from '@feathersjs/feathers';
import attachOwnerIdInQuery from '../../hooks/set-loggedin-user-in-query';
import * as commonHooks from 'feathers-hooks-common';
import logger from '../../app/logger';

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt')],
    find: [
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          },
          {
            model: 'subscription'
          },
          {
            model: 'location-admin'
          },
          {
            model: 'location-ban'
          },
          {
            model: 'user-settings'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          },
          {
            model: 'subscription'
          },
          {
            model: 'location-admin'
          },
          {
            model: 'location-ban'
          },
          {
            model: 'user-settings'
          }
        ]
      })
    ],
    create: [],
    update: [],
    patch: [
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          },
          {
            model: 'subscription'
          },
          {
            model: 'location-admin'
          },
          {
            model: 'location-ban'
          },
          {
            model: 'user-settings'
          }
        ]
      })
    ],
    remove: []
  },

  after: {
    all: [],
    find: [
      async (context: HookContext): Promise<HookContext> => {
        try {
          const { app, result } = context;
          result.data.forEach(async (item) => {
            if (item.subscriptions && item.subscriptions.length > 0) {
              await Promise.all(item.subscriptions.map(async (subscription: any) => {
                subscription.dataValues.subscriptionType = await context.app.service('subscription-type').get(subscription.plan);
              }));
            }

            const userAvatarResult = await app.service('static-resource').find({
              query: {
                staticResourceType: 'user-thumbnail',
                userId: item.id
              }
            });

            if (userAvatarResult.total > 0) {
              item.dataValues.avatarUrl = userAvatarResult.data[0].url;
            }
          });
          return context;
        } catch (err) {
          logger.error('USER AFTER FIND ERROR');
          logger.error(err);
        }
      }
    ],
    get: [
      async (context: HookContext): Promise<HookContext> => {
        try {
          if (context.result.subscriptions && context.result.subscriptions.length > 0) {
            await Promise.all(context.result.subscriptions.map(async (subscription: any) => {
              subscription.dataValues.subscriptionType = await context.app.service('subscription-type').get(subscription.plan);
            }));
          }

          const { id, app, result } = context;

          const userAvatarResult = await app.service('static-resource').find({
            query: {
              staticResourceType: 'user-thumbnail',
              userId: id
            }
          });
          if (userAvatarResult.total > 0) {
            result.dataValues.avatarUrl = userAvatarResult.data[0].url;
          }

          return context;
        } catch (err) {
          logger.error('USER AFTER GET ERROR');
          logger.error(err);
        }
      }
    ],
    create: [
        async (context: HookContext): Promise<HookContext> => {
          try {
            console.log('Created user');
            console.log(context.result);
            await context.app.service('user-settings').create({
              userId: context.result.id
            });

            return context;
          } catch(err) {
            logger.error('USER AFTER CREATE ERROR');
            logger.error(err);
          }
        }
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
