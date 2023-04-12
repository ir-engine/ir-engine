import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  // emailSettingDatabaseSchema,
  emailSettingDataSchema,
  emailSettingPatchSchema,
  emailSettingQuerySchema,
  emailSettingSchema
} from '@etherealengine/engine/src/schemas/setting/email-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  emailSettingDataResolver,
  emailSettingExternalResolver,
  emailSettingPatchResolver,
  emailSettingQueryResolver,
  emailSettingResolver
} from './email-setting.resolvers'

const emailSettingValidator = getValidator(emailSettingSchema, dataValidator)
const emailSettingDataValidator = getValidator(emailSettingDataSchema, dataValidator)
const emailSettingPatchValidator = getValidator(emailSettingPatchSchema, dataValidator)
const emailSettingQueryValidator = getValidator(emailSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(emailSettingExternalResolver), schemaHooks.resolveResult(emailSettingResolver)]
  },

  before: {
    all: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin') as any),
      schemaHooks.validateQuery(emailSettingQueryValidator),
      schemaHooks.resolveQuery(emailSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read') as any)],
    get: [iff(isProvider('external'), verifyScope('settings', 'read') as any)],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write') as any),
      schemaHooks.validateData(emailSettingDataValidator),
      schemaHooks.resolveData(emailSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write') as any)],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write') as any),
      schemaHooks.validateData(emailSettingPatchValidator),
      schemaHooks.resolveData(emailSettingPatchResolver)
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
