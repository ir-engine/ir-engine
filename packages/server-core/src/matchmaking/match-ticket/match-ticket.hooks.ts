import * as authentication from '@feathersjs/authentication'
import setLoggedInUser from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import matchmakingRestrictMultipleQueueing from '@xrengine/server-core/src/hooks/matchmaking-restrict-multiple-queueing'
import matchmakingSaveTicket from '@xrengine/server-core/src/hooks/matchmaking-save-ticket'
import * as commonHooks from 'feathers-hooks-common'
import matchmakingRemoveTicket from '@xrengine/server-core/src/hooks/matchmaking-remove-ticket'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      commonHooks.iff(commonHooks.isProvider('external'), authenticate('jwt') as any, setLoggedInUser('userId') as any),
      matchmakingRestrictMultipleQueueing()
      // addUUID()
    ],
    update: [commonHooks.disallow()],
    patch: [commonHooks.disallow()],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [matchmakingSaveTicket()],
    update: [],
    patch: [],
    remove: [matchmakingRemoveTicket()]
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
