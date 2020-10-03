import * as authentication from '@feathersjs/authentication';
import partyPermissionAuthenticate from '../../hooks/party-permission-authenticate';
import partyUserPermissionAuthenticate from '../../hooks/party-user-permission-authenticate';
import { HookContext } from '@feathersjs/feathers';
import { disallow, iff, isProvider } from 'feathers-hooks-common';
import collectAnalytics from '../../hooks/collect-analytics';
import unsetSelfPartyOwner from '../../hooks/unset-self-party-owner';
import checkPartyInstanceSize from '../../hooks/check-party-instance-size';

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [
      iff(
        isProvider('external'),
        partyUserPermissionAuthenticate()
      )
    ],
    get: [],
    create: [disallow('external')],
    update: [disallow()],
    patch: [
        partyPermissionAuthenticate()
    ],
    remove: [
      partyPermissionAuthenticate()
    ]
  },

  after: {
    all: [],
    find: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context;
        await Promise.all(result.data.map(async (partyUser) => {
          partyUser.user = await app.service('user').get(partyUser.userId);
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
    create: [
        checkPartyInstanceSize()
    ],
    update: [],
    patch: [
        unsetSelfPartyOwner()
    ],
    remove: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, params } = context;
        if (params.partyUsersRemoved !== true) {
          const partyUserCount = await app.service('party-user').find({
            query: {
              partyId: params.query.partyId,
              $limit: 0
            }
          });
          if (partyUserCount.total < 1) {
            await app.service('party').remove(params.query.partyId, params);
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
    update: [disallow()],
    patch: [],
    remove: []
  }
};
