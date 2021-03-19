import { HookContext } from "@feathersjs/feathers";
import logger from "../../app/logger";
// import { addFeedFire } from "../../hooks/notifications";

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        try {
          const { app, result } = context;
          console.warn('contex', context)
          // result.data.forEach(async (item) => {
          //   if (item.subscriptions && item.subscriptions.length > 0) {
          //     await Promise.all(item.subscriptions.map(async (subscription: any) => {
          //       subscription.dataValues.subscriptionType = await context.app.service('subscription-type').get(subscription.plan);
          //     }));
          //   }

          //   const userAvatarResult = await app.service('static-resource').find({
          //     query: {
          //       staticResourceType: 'user-thumbnail',
          //       userId: item.id
          //     }
          //   });

          //   if (userAvatarResult.total > 0 && item.dataValues) {
          //     item.dataValues.avatarUrl = userAvatarResult.data[0].url;
          //   }
          // });
          return context;
        } catch (err) {
          logger.error('USER AFTER FIND ERROR');
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
