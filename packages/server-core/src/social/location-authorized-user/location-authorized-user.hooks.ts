import * as authentication from '@feathersjs/authentication'
import restrictUserRole from '../../hooks/restrict-user-role'
import * as commonHooks from 'feathers-hooks-common'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [authenticate('jwt'), commonHooks.iff(commonHooks.isProvider('external'), restrictUserRole('admin') as any)],
    get: [authenticate('jwt'), commonHooks.iff(commonHooks.isProvider('external'), restrictUserRole('admin') as any)],
    create: [
      authenticate('jwt'),
      commonHooks.iff(commonHooks.isProvider('external'), restrictUserRole('admin') as any)
    ],
    update: [
      authenticate('jwt'),
      commonHooks.iff(commonHooks.isProvider('external'), restrictUserRole('admin') as any)
    ],
    patch: [authenticate('jwt'), commonHooks.iff(commonHooks.isProvider('external'), restrictUserRole('admin') as any)],
    remove: [authenticate('jwt'), commonHooks.iff(commonHooks.isProvider('external'), restrictUserRole('admin') as any)]
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
