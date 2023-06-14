import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  matchInstanceDataSchema,
  matchInstancePatchSchema,
  matchInstanceQuerySchema,
  matchInstanceSchema
} from '@etherealengine/engine/src/schemas/matchmaking/match-instance.schema'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import createInstance from '../../hooks/matchmaking-create-instance'
import {
  matchInstanceDataResolver,
  matchInstanceExternalResolver,
  matchInstancePatchResolver,
  matchInstanceQueryResolver,
  matchInstanceResolver
} from './match-instance.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const matchInstanceValidator = getValidator(matchInstanceSchema, dataValidator)
const matchInstanceDataValidator = getValidator(matchInstanceDataSchema, dataValidator)
const matchInstancePatchValidator = getValidator(matchInstancePatchSchema, dataValidator)
const matchInstanceQueryValidator = getValidator(matchInstanceQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(matchInstanceExternalResolver), schemaHooks.resolveResult(matchInstanceResolver)]
  },

  before: {
    all: [
      () => schemaHooks.validateQuery(matchInstanceQueryValidator),
      schemaHooks.resolveQuery(matchInstanceQueryResolver)
    ],
    find: [],
    get: [iff(isProvider('external'), authenticate() as any, setLoggedInUser('userId'))],
    create: [
      iff(isProvider('external'), disallow()),
      () => schemaHooks.validateData(matchInstanceDataValidator),
      schemaHooks.resolveData(matchInstanceDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), disallow()),
      () => schemaHooks.validateData(matchInstancePatchValidator),
      schemaHooks.resolveData(matchInstancePatchResolver)
    ],
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
