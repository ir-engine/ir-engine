import authenticate from '../../hooks/authenticate'
import setResponseStatusCode from '@xrengine/server-core/src/hooks/set-response-status-code'
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
