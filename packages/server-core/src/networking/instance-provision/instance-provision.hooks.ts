import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [disallow() /*iff(isProvider('external'), restrictUserRole('admin') as any)*/],
    create: [disallow() /*iff(isProvider('external'), restrictUserRole('admin') as any)*/],
    update: [disallow() /*iff(isProvider('external'), restrictUserRole('admin') as any)*/],
    patch: [disallow() /*iff(isProvider('external'), restrictUserRole('admin') as any)*/],
    remove: [disallow() /*iff(isProvider('external'), restrictUserRole('admin') as any)*/]
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
