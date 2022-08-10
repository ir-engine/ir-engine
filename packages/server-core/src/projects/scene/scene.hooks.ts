import authenticate from '../../hooks/authenticate'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import setResponseStatusCode from '../../hooks/set-response-status-code'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [verifyScope('editor', 'write'), projectPermissionAuthenticate(false)],
    update: [verifyScope('editor', 'write'), projectPermissionAuthenticate(false)],
    patch: [verifyScope('editor', 'write'), projectPermissionAuthenticate(false)],
    remove: [verifyScope('editor', 'write'), projectPermissionAuthenticate(false)]
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
