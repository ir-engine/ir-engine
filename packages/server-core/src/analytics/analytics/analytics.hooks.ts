import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  analyticsDataSchema,
  analyticsPatchSchema,
  analyticsQuerySchema,
  analyticsSchema
} from '@etherealengine/engine/src/schemas/analytics/analytics.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  analyticsDataResolver,
  analyticsExternalResolver,
  analyticsPatchResolver,
  analyticsQueryResolver,
  analyticsResolver
} from './analytics.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const analyticsValidator = getValidator(analyticsSchema, dataValidator)
const analyticsDataValidator = getValidator(analyticsDataSchema, dataValidator)
const analyticsPatchValidator = getValidator(analyticsPatchSchema, dataValidator)
const analyticsQueryValidator = getValidator(analyticsQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(analyticsExternalResolver), schemaHooks.resolveResult(analyticsResolver)]
  },

  before: {
    all: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(analyticsQueryValidator),
      schemaHooks.resolveQuery(analyticsQueryResolver)
    ],
    find: [],
    get: [],
    create: [schemaHooks.validateData(analyticsDataValidator), schemaHooks.resolveData(analyticsDataResolver)],
    update: [],
    patch: [schemaHooks.validateData(analyticsPatchValidator), schemaHooks.resolveData(analyticsPatchResolver)],
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
}
