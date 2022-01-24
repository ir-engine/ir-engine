import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'
import { iff, isProvider } from 'feathers-hooks-common'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)],
    update: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)],
    patch: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)],
    remove: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)]
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
