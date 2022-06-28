import { disallow, iff, isProvider } from 'feathers-hooks-common'

import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
    get: [disallow('external')],
    create: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    update: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    patch: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    remove: [iff(isProvider('external'), restrictUserRole('admin') as any)]
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
