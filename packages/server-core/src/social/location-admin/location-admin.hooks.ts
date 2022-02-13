import authenticate from '../../hooks/authenticate'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'
import { iff, isProvider } from 'feathers-hooks-common'

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
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
