import { iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [authenticate(), verifyScope('editor', 'write')],
    update: [authenticate(), verifyScope('editor', 'write')],
    patch: [authenticate(), verifyScope('editor', 'write')],
    remove: [authenticate(), verifyScope('editor', 'write')]
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
