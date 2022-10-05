import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [iff(isProvider('external'), disallow())],
    create: [iff(isProvider('external'), disallow())],
    update: [iff(isProvider('external'), disallow())],
    patch: [iff(isProvider('external'), disallow())],
    remove: [iff(isProvider('external'), disallow())]
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
