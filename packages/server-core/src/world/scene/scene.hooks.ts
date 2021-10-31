import * as authentication from '@feathersjs/authentication'
import setResponseStatusCode from '@xrengine/server-core/src/hooks/set-response-status-code'
import restrictUserRole from '../../hooks/restrict-user-role'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [authenticate('jwt'), restrictUserRole('admin')], // TODO: replace admin with scopes
    update: [authenticate('jwt'), restrictUserRole('admin')],
    patch: [authenticate('jwt'), restrictUserRole('admin')],
    remove: [authenticate('jwt'), restrictUserRole('admin')]
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
