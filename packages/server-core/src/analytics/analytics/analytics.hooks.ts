import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  analyticsDataResolver,
  analyticsDataValidator,
  analyticsExternalResolver,
  analyticsPatchResolver,
  analyticsPatchValidator,
  analyticsQueryResolver,
  analyticsQueryValidator,
  analyticsResolver
} from './analytics.schema'

export default {
  around: {
    all: [schemaHooks.resolveExternal(analyticsExternalResolver), schemaHooks.resolveResult(analyticsResolver)]
  },

  before: {
    all: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin') as any),
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
} as any
