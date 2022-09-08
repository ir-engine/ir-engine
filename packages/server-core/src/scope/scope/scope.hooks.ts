import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate(), iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    find: [iff(isProvider('external'), verifyScope('user', 'read') as any)],
    get: [iff(isProvider('external'), verifyScope('user', 'read') as any)],
    create: [iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('user', 'write') as any)],
    update: [disallow()],
    patch: [disallow()],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('user', 'write') as any)]
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
