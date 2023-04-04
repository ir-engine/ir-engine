import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  chargebeeSettingDataSchema,
  chargebeeSettingPatchSchema,
  chargebeeSettingQuerySchema
} from '@etherealengine/engine/src/schemas/setting/chargebee-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  chargebeeSettingDataResolver,
  chargebeeSettingExternalResolver,
  chargebeeSettingPatchResolver,
  chargebeeSettingQueryResolver,
  chargebeeSettingResolver
} from './chargebee-setting.resolvers'

const chargebeeSettingDataValidator = getValidator(chargebeeSettingDataSchema, dataValidator)
const chargebeeSettingPatchValidator = getValidator(chargebeeSettingPatchSchema, dataValidator)
const chargebeeSettingQueryValidator = getValidator(chargebeeSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(chargebeeSettingExternalResolver),
      schemaHooks.resolveResult(chargebeeSettingResolver)
    ]
  },

  before: {
    all: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin') as any),
      schemaHooks.validateQuery(chargebeeSettingQueryValidator),
      schemaHooks.resolveQuery(chargebeeSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read') as any)],
    get: [iff(isProvider('external'), verifyScope('settings', 'read') as any)],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write') as any),
      schemaHooks.validateData(chargebeeSettingDataValidator),
      schemaHooks.resolveData(chargebeeSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write') as any)],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write') as any),
      schemaHooks.validateData(chargebeeSettingPatchValidator),
      schemaHooks.resolveData(chargebeeSettingPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('settings', 'write') as any)]
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
