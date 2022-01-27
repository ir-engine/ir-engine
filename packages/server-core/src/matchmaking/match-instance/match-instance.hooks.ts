import authenticate from '../../hooks/authenticate'
import setLoggedInUser from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import matchmakingRestrictMultipleQueueing from '@xrengine/server-core/src/hooks/matchmaking-restrict-multiple-queueing'
import matchmakingSaveTicket from '@xrengine/server-core/src/hooks/matchmaking-save-ticket'
import { iff, isProvider, disallow } from 'feathers-hooks-common'
import matchmakingRemoveTicket from '@xrengine/server-core/src/hooks/matchmaking-remove-ticket'
import createInstance from '../../hooks/matchmaking-create-instance'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [],
    find: [],
    get: [iff(isProvider('external'), authenticate() as any, setLoggedInUser('userId') as any)],
    create: [iff(isProvider('external'), disallow())],
    update: [disallow()],
    patch: [iff(isProvider('external'), disallow())],
    remove: [iff(isProvider('external'), disallow())]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createInstance()],
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
