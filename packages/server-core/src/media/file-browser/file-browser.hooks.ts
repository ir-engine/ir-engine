import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate(), iff(isProvider('external'), verifyScope('editor', 'write') as any)],
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
