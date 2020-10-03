import collectAnalytics from '../../hooks/collect-analytics';
import groupPermissionAuthenticate from '../../hooks/group-permission-authenticate';
import groupUserPermissionAuthenticate from '../../hooks/group-user-permission-authenticate';
import * as authentication from '@feathersjs/authentication';
import { disallow, isProvider, iff } from 'feathers-hooks-common';
import { HookContext } from '@feathersjs/feathers';

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [
      iff(
        isProvider('external'),
        groupUserPermissionAuthenticate()
      )
    ],
    get: [],
    create: [disallow('external')],
    update: [],
    patch: [],
    remove: [
      groupPermissionAuthenticate()
    ]
  },

  after: {
    all: [],
    find: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context;
        await Promise.all(result.data.map(async (groupUser) => {
          groupUser.user = await app.service('user').get(groupUser.userId);
        }));
        return context;
      }
    ],
    get: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context;
        result.user = await app.service('user').get(result.userId);
        return context;
      }
    ],
    create: [],
    update: [],
    patch: [],
    remove: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, params } = context;
        if (params.groupUsersRemoved !== true) {
          const groupUserCount = await app.service('group-user').find({
            query: {
              groupId: params.query.groupId,
              $limit: 0
            }
          });
          if (groupUserCount.total < 1) {
            await app.service('group').remove(params.query.groupId, params);
          }
        }
        return context;
      }
    ]
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
