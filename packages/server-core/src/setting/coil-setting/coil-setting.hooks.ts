import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  coilSettingDataSchema,
  coilSettingPatchSchema,
  coilSettingQuerySchema,
  coilSettingSchema
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const coilSettingValidator = getValidator(coilSettingSchema, dataValidator)
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
      () => schemaHooks.validateQuery(coilSettingQueryValidator),
      schemaHooks.resolveQuery(coilSettingQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(coilSettingDataValidator),
      schemaHooks.resolveData(coilSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(coilSettingPatchValidator),
      schemaHooks.resolveData(coilSettingPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))]
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
