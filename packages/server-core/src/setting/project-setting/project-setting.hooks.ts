import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [authenticate(), iff(isProvider('external'), verifyScope('editor', 'write') as any)], // TODO: project based scopes #5613
    get: [disallow()],
    create: [disallow()],
    update: [disallow()],
    patch: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('editor', 'write') as any)
    ],
    remove: [disallow()]
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
