import * as authentication from '@feathersjs/authentication'

import setResponseStatusCode from '@xrengine/server-core/src/hooks/set-response-status-code'

import verifyScope from '../../hooks/verify-scope'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [authenticate('jwt'), verifyScope('editor', 'write')],
    update: [authenticate('jwt'), verifyScope('editor', 'write')],
    patch: [authenticate('jwt'), verifyScope('editor', 'write')],
    remove: [authenticate('jwt'), verifyScope('editor', 'write')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      // Editor is expecting 200, while feather is sending 201 for creation
      setResponseStatusCode(200)
    ],
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
