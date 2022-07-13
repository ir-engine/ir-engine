import { HookOptions } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import partyPermissionAuthenticate from '@xrengine/server-core/src/hooks/party-permission-authenticate'

import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    get: [],
    create: [],
    update: [disallow()],
    patch: [iff(isProvider('external'), partyPermissionAuthenticate() as any)],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
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
} as HookOptions<any, any>
