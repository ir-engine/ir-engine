import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyLocationAdmin from '../../hooks/verify-location-admin'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [iff(isProvider('external'), verifyLocationAdmin() as any)],
    update: [disallow()],
    patch: [disallow()],
    remove: [iff(isProvider('external'), verifyLocationAdmin() as any)]
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
