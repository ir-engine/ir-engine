import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import restrictUserRole from '@xrengine/server-core/src/hooks/restrict-user-role'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate('jwt'), restrictUserRole('admin')],
    update: [authenticate('jwt'), restrictUserRole('admin')],
    patch: [authenticate('jwt'), restrictUserRole('admin')],
    remove: [authenticate('jwt'), restrictUserRole('admin')]
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
