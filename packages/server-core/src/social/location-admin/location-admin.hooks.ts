import { disallow, iff, isProvider } from 'feathers-hooks-common'

import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
    get: [disallow('external')],
    create: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    patch: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)]
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
} as any
