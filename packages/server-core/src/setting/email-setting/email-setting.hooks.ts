import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  emailAuthSchema,
  emailSettingDataSchema,
  emailSettingPatchSchema,
  emailSettingQuerySchema,
  emailSettingSchema,
  emailSmtpSchema,
  emailSubjectSchema
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emailSubjectValidator = getValidator(emailSubjectSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emailAuthValidator = getValidator(emailAuthSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emailSmtpValidator = getValidator(emailSmtpSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateQuery(emailSettingQueryValidator),
      schemaHooks.resolveQuery(emailSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(emailSettingDataValidator),
      schemaHooks.resolveData(emailSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(emailSettingPatchValidator),
      schemaHooks.resolveData(emailSettingPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('settings', 'write'))]
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
