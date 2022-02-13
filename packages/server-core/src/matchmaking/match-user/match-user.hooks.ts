import authenticate from '../../hooks/authenticate'
import setLoggedInUser from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import setLoggedInUserInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'
import { iff, isProvider } from 'feathers-hooks-common'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), authenticate() as any, setLoggedInUserInQuery('userId') as any)],
    get: [],
    create: [iff(isProvider('external'), authenticate() as any, setLoggedInUser('userId') as any)],
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
