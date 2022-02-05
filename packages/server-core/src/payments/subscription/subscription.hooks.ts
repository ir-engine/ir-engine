import authenticate from '../../hooks/authenticate'
import { disallow } from 'feathers-hooks-common'
import setLoggedInUser from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [],
    find: [authenticate()],
    get: [authenticate()],
    create: [authenticate(), setLoggedInUser('userId')],
    update: [disallow('external')],
    patch: [disallow('external')],
    remove: [disallow('external')]
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
