import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  routeDataResolver,
  routeDataValidator,
  routeExternalResolver,
  routePatchResolver,
  routePatchValidator,
  routeQueryResolver,
  routeQueryValidator,
  routeResolver
} from './route.schema'

export default {
  around: {
    all: [schemaHooks.resolveExternal(routeExternalResolver), schemaHooks.resolveResult(routeResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(routeQueryValidator), schemaHooks.resolveQuery(routeQueryResolver)],
    find: [],
    get: [],
    create: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin') as any),
      schemaHooks.validateData(routeDataValidator),
      schemaHooks.resolveData(routeDataResolver)
    ],
    update: [authenticate(), iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    patch: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin') as any),
      schemaHooks.validateData(routePatchValidator),
      schemaHooks.resolveData(routePatchResolver)
    ],
    remove: [authenticate(), iff(isProvider('external'), verifyScope('admin', 'admin') as any)]
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
