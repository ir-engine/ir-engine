import * as authentication from '@feathersjs/authentication'
import setLoggedInUser from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import setLoggedInUserInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'
import * as commonHooks from 'feathers-hooks-common'

const { authenticate } = authentication.hooks

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate('jwt')],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt') as any,
        setLoggedInUserInQuery('userId') as any
      )
    ],
    get: [],
    create: [
      commonHooks.iff(commonHooks.isProvider('external'), authenticate('jwt') as any, setLoggedInUser('userId') as any)
    ],
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
