import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  serverHubSchema,
  serverSettingDataSchema,
  serverSettingPatchSchema,
  serverSettingQuerySchema,
  serverSettingSchema
} from '@etherealengine/engine/src/schemas/setting/server-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  serverSettingDataResolver,
  serverSettingExternalResolver,
  serverSettingPatchResolver,
  serverSettingQueryResolver,
  serverSettingResolver
} from './server-setting.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const serverHubValidator = getValidator(serverHubSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const serverSettingValidator = getValidator(serverSettingSchema, dataValidator)
const serverSettingDataValidator = getValidator(serverSettingDataSchema, dataValidator)
const serverSettingPatchValidator = getValidator(serverSettingPatchSchema, dataValidator)
const serverSettingQueryValidator = getValidator(serverSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(serverSettingExternalResolver), schemaHooks.resolveResult(serverSettingResolver)]
  },

  before: {
    all: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(serverSettingQueryValidator),
      schemaHooks.resolveQuery(serverSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(serverSettingDataValidator),
      schemaHooks.resolveData(serverSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(serverSettingPatchValidator),
      schemaHooks.resolveData(serverSettingPatchResolver)
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
}
