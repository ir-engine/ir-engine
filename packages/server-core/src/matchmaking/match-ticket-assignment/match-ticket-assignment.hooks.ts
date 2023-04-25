import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { disallow } from 'feathers-hooks-common'

import {
  matchTicketAssignmentQuerySchema,
  matchTicketAssignmentSchema
} from '@etherealengine/matchmaking/src/match-ticket-assignment.schema'
import linkMatchUserToMatch from '@etherealengine/server-core/src/hooks/matchmaking-link-match-user-to-match'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import {
  matchTicketAssignmentExternalResolver,
  matchTicketAssignmentQueryResolver,
  matchTicketAssignmentResolver
} from './match-ticket-assignment.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const matchTicketAssignmentValidator = getValidator(matchTicketAssignmentSchema, dataValidator)
const matchTicketAssignmentQueryValidator = getValidator(matchTicketAssignmentQuerySchema, queryValidator)

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(matchTicketAssignmentExternalResolver),
      schemaHooks.resolveResult(matchTicketAssignmentResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(matchTicketAssignmentQueryValidator),
      schemaHooks.resolveQuery(matchTicketAssignmentQueryResolver)
    ],
    find: [],
    get: [],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [linkMatchUserToMatch()], // createLocationIfNotExists - is side effect...
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
