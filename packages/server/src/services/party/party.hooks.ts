import * as authentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';
import partyPermissionAuthenticate from '../../hooks/party-permission-authenticate';
import createPartyOwner from '../../hooks/create-party-owner';
import removePartyUsers from '../../hooks/remove-party-users';
import collectAnalytics from '../../hooks/collect-analytics';
import { HookContext } from '@feathersjs/feathers';
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [],
    get: [],
    create: [
      async (context): Promise<HookContext> => {
        const loggedInUser = extractLoggedInUserFromParams(context.params);
        const currentPartyUser = await context.app.service('party-user').find({
          query: {
            userId: loggedInUser.userId
          }
        });
        if (currentPartyUser.total > 0) {
          await context.app.service('party-user').remove(currentPartyUser.data[0].id);
          await context.app.service('user').patch(loggedInUser.userId, {
            partyId: null
          });
        }
        return context;
      }
    ],
    update: [disallow()],
    patch: [],
    // TODO: Need to ask if we allow user to remove party or not
    remove: [
      partyPermissionAuthenticate(),
      removePartyUsers()
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      createPartyOwner()
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
