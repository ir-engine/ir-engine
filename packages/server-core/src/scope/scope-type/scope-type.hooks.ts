import * as authentication from '@feathersjs/authentication'
import restrictUserRole from '@xrengine/server-core/src/hooks/restrict-user-role'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [restrictUserRole('admin')],
    update: [restrictUserRole('admin')],
    patch: [restrictUserRole('admin')],
    remove: [restrictUserRole('admin')]
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
