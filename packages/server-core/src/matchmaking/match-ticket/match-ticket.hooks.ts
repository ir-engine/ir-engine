import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  matchSearchFieldsSchema,
  matchTicketDataSchema,
  matchTicketQuerySchema,
  matchTicketSchema
} from '@etherealengine/matchmaking/src/match-ticket.schema'
import matchmakingRemoveTicket from '@etherealengine/server-core/src/hooks/matchmaking-remove-ticket'
import matchmakingRestrictMultipleQueueing from '@etherealengine/server-core/src/hooks/matchmaking-restrict-multiple-queueing'
import matchmakingSaveTicket from '@etherealengine/server-core/src/hooks/matchmaking-save-ticket'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import {
  matchTicketDataResolver,
  matchTicketExternalResolver,
  matchTicketQueryResolver,
  matchTicketResolver
} from './match-ticket.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const matchSearchFieldsValidator = getValidator(matchSearchFieldsSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const matchTicketValidator = getValidator(matchTicketSchema, dataValidator)
const matchTicketDataValidator = getValidator(matchTicketDataSchema, dataValidator)
const matchTicketQueryValidator = getValidator(matchTicketQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(matchTicketExternalResolver), schemaHooks.resolveResult(matchTicketResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(matchTicketQueryValidator), schemaHooks.resolveQuery(matchTicketQueryResolver)],
    find: [],
    get: [iff(isProvider('external'), authenticate() as any, setLoggedInUser('userId') as any)],
    create: [
      iff(isProvider('external'), authenticate() as any, setLoggedInUser('userId') as any),
      matchmakingRestrictMultipleQueueing(),
      // addUUID(),
      schemaHooks.validateData(matchTicketDataValidator),
      schemaHooks.resolveData(matchTicketDataResolver)
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: [iff(isProvider('external'))]
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
