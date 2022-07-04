import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyProjectOwner from '../../hooks/verify-project-owner'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [iff(isProvider('external'), verifyProjectOwner() as any)],
    update: [disallow()],
    patch: [iff(isProvider('external'), verifyProjectOwner() as any)],
    remove: [iff(isProvider('external'), verifyProjectOwner() as any)]
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
