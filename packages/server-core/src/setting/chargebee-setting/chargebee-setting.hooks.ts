import { iff, isProvider } from 'feathers-hooks-common'

import restrictUserRole from '@xrengine/server-core/src/hooks/restrict-user-role'

import authenticate from '../../hooks/authenticate'

export default {
  before: {
    all: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)],
    find: [],
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
