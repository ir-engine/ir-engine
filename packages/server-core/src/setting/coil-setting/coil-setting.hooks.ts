import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  coilSettingDataSchema,
  coilSettingPatchSchema,
  coilSettingQuerySchema
} from '@etherealengine/engine/src/schemas/setting/coil-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  coilSettingDataResolver,
  coilSettingExternalResolver,
  coilSettingPatchResolver,
  coilSettingQueryResolver,
  coilSettingResolver
} from './coil-setting.resolvers'

const coilSettingDataValidator = getValidator(coilSettingDataSchema, dataValidator)
const coilSettingPatchValidator = getValidator(coilSettingPatchSchema, dataValidator)
const coilSettingQueryValidator = getValidator(coilSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(coilSettingExternalResolver), schemaHooks.resolveResult(coilSettingResolver)]
  },

  before: {
    all: [
      authenticate(),
      schemaHooks.validateQuery(coilSettingQueryValidator),
      schemaHooks.resolveQuery(coilSettingQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('settings', 'write') as any),
      schemaHooks.validateData(coilSettingDataValidator),
      schemaHooks.resolveData(coilSettingDataResolver)
    ],
    update: [
      iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('settings', 'write') as any)
    ],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('settings', 'write') as any),
      schemaHooks.validateData(coilSettingPatchValidator),
      schemaHooks.resolveData(coilSettingPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('settings', 'write') as any)]
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
