import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  clientSettingDataSchema,
  clientSettingPatchSchema,
  clientSettingQuerySchema,
  clientSettingSchema,
  clientSocialLinkSchema,
  clientThemeOptionsSchema
} from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  clientSettingDataResolver,
  clientSettingExternalResolver,
  clientSettingPatchResolver,
  clientSettingQueryResolver,
  clientSettingResolver
} from './client-setting.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const clientSocialLinkValidator = getValidator(clientSocialLinkSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const clientThemeOptionsValidator = getValidator(clientThemeOptionsSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const clientSettingValidator = getValidator(clientSettingSchema, dataValidator)
const clientSettingDataValidator = getValidator(clientSettingDataSchema, dataValidator)
const clientSettingPatchValidator = getValidator(clientSettingPatchSchema, dataValidator)
const clientSettingQueryValidator = getValidator(clientSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(clientSettingExternalResolver), schemaHooks.resolveResult(clientSettingResolver)]
  },

  before: {
    all: [
      () => schemaHooks.validateQuery(clientSettingQueryValidator),
      schemaHooks.resolveQuery(clientSettingQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(clientSettingDataValidator),
      schemaHooks.resolveData(clientSettingDataResolver)
    ],
    update: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))
    ],
    patch: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(clientSettingPatchValidator),
      schemaHooks.resolveData(clientSettingPatchResolver)
    ],
    remove: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))
    ]
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
