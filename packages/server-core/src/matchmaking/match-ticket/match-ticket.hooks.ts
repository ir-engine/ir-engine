import * as authentication from '@feathersjs/authentication'
import setLoggedInUser from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import matchmakingRestrictMultipleQueueing from '@xrengine/server-core/src/hooks/matchmaking-restrict-multiple-queueing'
import matchmakingSaveTicket from '@xrengine/server-core/src/hooks/matchmaking-save-ticket'
import { iff, isProvider, disallow } from 'feathers-hooks-common'
import matchmakingRemoveTicket from '@xrengine/server-core/src/hooks/matchmaking-remove-ticket'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [],
    get: [iff(isProvider('external'), authenticate('jwt') as any, setLoggedInUser('userId') as any)],
    create: [
      iff(isProvider('external'), authenticate('jwt') as any, setLoggedInUser('userId') as any),
      matchmakingRestrictMultipleQueueing()
      // addUUID()
    ],
    update: [disallow()],
    patch: [disallow()],
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
