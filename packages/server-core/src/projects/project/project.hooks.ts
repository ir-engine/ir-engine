import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import { iff, isProvider } from 'feathers-hooks-common'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate(), iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    update: [authenticate(), iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    patch: [authenticate(), iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    remove: [authenticate(), iff(isProvider('external'), verifyScope('editor', 'write') as any)]
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
