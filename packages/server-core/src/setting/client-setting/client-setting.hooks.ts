import * as authentication from '@feathersjs/authentication'
import restrictUserRole from '@xrengine/server-core/src/hooks/restrict-user-role'
import { iff, isProvider } from 'feathers-hooks-common'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate('jwt'), iff(isProvider('external'), restrictUserRole('admin') as any)],
    update: [authenticate('jwt'), iff(isProvider('external'), restrictUserRole('admin') as any)],
    patch: [authenticate('jwt'), iff(isProvider('external'), restrictUserRole('admin') as any)],
    remove: [authenticate('jwt'), iff(isProvider('external'), restrictUserRole('admin') as any)]
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
