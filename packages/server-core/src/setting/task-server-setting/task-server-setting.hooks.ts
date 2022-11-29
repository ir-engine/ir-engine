import { iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate(), iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    find: [iff(isProvider('external'), verifyScope('settings', 'read') as any)],
    get: [iff(isProvider('external'), verifyScope('settings', 'read') as any)],
    create: [iff(isProvider('external'), verifyScope('settings', 'write') as any)],
    update: [iff(isProvider('external'), verifyScope('settings', 'write') as any)],
    patch: [iff(isProvider('external'), verifyScope('settings', 'write') as any)],
    remove: [iff(isProvider('external'), verifyScope('settings', 'write') as any)]
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
