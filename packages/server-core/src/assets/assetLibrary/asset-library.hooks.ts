import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate()],
    find: [disallow()],
    get: [disallow()],
    create: [iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    update: [disallow() /*verifyScope('editor', 'write')*/],
    patch: [disallow() /*verifyScope('editor', 'write')*/],
    remove: [disallow() /*verifyScope('editor', 'write')*/]
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
