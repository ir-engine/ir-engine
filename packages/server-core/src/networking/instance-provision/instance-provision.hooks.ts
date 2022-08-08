import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/],
    create: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/],
    update: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/],
    patch: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/],
    remove: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/]
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
