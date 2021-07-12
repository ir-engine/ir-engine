import collectAnalytics from '@xrengine/server-core/src/hooks/collect-analytics'
import groupPermissionAuthenticate from '@xrengine/server-core/src/hooks/group-permission-authenticate'
import createGroupOwner from '@xrengine/server-core/src/hooks/create-group-owner'
import removeGroupUsers from '@xrengine/server-core/src/hooks/remove-group-users'
import * as authentication from '@feathersjs/authentication'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [],
    get: [],
    create: [],
    update: [groupPermissionAuthenticate()],
    patch: [groupPermissionAuthenticate()],
    remove: [groupPermissionAuthenticate(), removeGroupUsers()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createGroupOwner()],
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
}
