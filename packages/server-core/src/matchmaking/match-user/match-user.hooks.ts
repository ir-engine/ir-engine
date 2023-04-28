import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  matchUserDataSchema,
  matchUserPatchSchema,
  matchUserQuerySchema,
  matchUserSchema
} from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import setLoggedInUserInQuery from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-query'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import {
  matchUserDataResolver,
  matchUserExternalResolver,
  matchUserPatchResolver,
  matchUserQueryResolver,
  matchUserResolver
} from './match-user.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const matchUserValidator = getValidator(matchUserSchema, dataValidator)
const matchUserDataValidator = getValidator(matchUserDataSchema, dataValidator)
const matchUserPatchValidator = getValidator(matchUserPatchSchema, dataValidator)
const matchUserQueryValidator = getValidator(matchUserQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(matchUserExternalResolver), schemaHooks.resolveResult(matchUserResolver)]
  },

  before: {
    all: [
      authenticate(),
      schemaHooks.validateQuery(matchUserQueryValidator),
      schemaHooks.resolveQuery(matchUserQueryResolver)
    ],
    find: [iff(isProvider('external'), authenticate() as any, setLoggedInUserInQuery('userId') as any)],
    get: [],
    create: [
      iff(isProvider('external'), authenticate() as any, setLoggedInUser('userId') as any),
      schemaHooks.validateData(matchUserDataValidator),
      schemaHooks.resolveData(matchUserDataResolver)
    ],
    update: [],
    patch: [schemaHooks.validateData(matchUserPatchValidator), schemaHooks.resolveData(matchUserPatchResolver)],
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
