import * as authentication from '@feathersjs/authentication';
import partyPermissionAuthenticate from '../../hooks/party-permission-authenticate';
import partyUserPermissionAuthenticate from '../../hooks/party-user-permission-authenticate';
import { HookContext } from '@feathersjs/feathers';
import { disallow, iff, isProvider } from 'feathers-hooks-common';
import collectAnalytics from '../../hooks/collect-analytics';
import unsetSelfPartyOwner from '../../hooks/unset-self-party-owner';
import checkPartyInstanceSize from '../../hooks/check-party-instance-size';
import {extractLoggedInUserFromParams} from "../auth-management/auth-management.utils";

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
    create: [
        async (context: HookContext): Promise<HookContext> => {
          try {
            const {app, params, data} = context;
            const loggedInUser = extractLoggedInUserFromParams(params);
            const partyUserResult = await app.service('party-user').find({
              query: {
                userId: loggedInUser.userId
              }
            });

            await Promise.all(partyUserResult.data.map(partyUser => {
              return app.service('party-user').remove(partyUser.id, params);
            }));

            if (data.userId == null) {
              data.userId = loggedInUser.userId;
            }
            return context;
          } catch(err) {
            console.log(err);
          }
        },
        partyPermissionAuthenticate()
    ],
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
        async (context: HookContext): Promise<HookContext> => {
          const { app, params, result } = context;
          await app.service('user').patch(result.userId, {
            partyId: result.partyId
          });
          return context;
        },
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
          const party = await app.service('party').get(params.query.partyId);
          const partyUserCount = await app.service('party-user').find({
            query: {
              partyId: params.query.partyId,
              $limit: 0
            }
          });
          if (partyUserCount.total < 1 && party.locationId == null) {
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
