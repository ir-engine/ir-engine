import { iff, isProvider } from 'feathers-hooks-common'

import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
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
