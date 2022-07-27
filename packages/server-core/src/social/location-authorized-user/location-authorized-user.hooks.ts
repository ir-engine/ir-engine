import { disallow, iff, isProvider } from 'feathers-hooks-common'

import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
    create: [disallow('external')],
    update: [disallow('external')],
    patch: [disallow('external')],
    remove: [disallow('external')]
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
