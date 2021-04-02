import collectAnalytics from '../../hooks/collect-analytics';
import groupPermissionAuthenticate from '../../hooks/group-permission-authenticate';
import createGroupOwner from '../../hooks/create-group-owner';
import removeGroupUsers from '../../hooks/remove-group-users';
import * as authentication from '@feathersjs/authentication';

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [],
    get: [],
    create: [],
    update: [
      groupPermissionAuthenticate()
    ],
    patch: [
      groupPermissionAuthenticate()
    ],
    remove: [
      groupPermissionAuthenticate(),
      removeGroupUsers()
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      createGroupOwner()
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
