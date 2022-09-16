import { disallow } from 'feathers-hooks-common'

import logRequest from '@xrengine/server-core/src/hooks/log-request'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [logRequest()],
    find: [],
    get: [disallow()],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
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
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
