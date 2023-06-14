import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  instanceServerSettingDataSchema,
  instanceServerSettingPatchSchema,
  instanceServerSettingQuerySchema,
  instanceServerSettingSchema
} from '@etherealengine/engine/src/schemas/setting/instance-server-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  instanceServerSettingDataResolver,
  instanceServerSettingExternalResolver,
  instanceServerSettingPatchResolver,
  instanceServerSettingQueryResolver,
  instanceServerSettingResolver
} from './instance-server-setting.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const instanceServerSettingValidator = getValidator(instanceServerSettingSchema, dataValidator)
const instanceServerSettingDataValidator = getValidator(instanceServerSettingDataSchema, dataValidator)
const instanceServerSettingPatchValidator = getValidator(instanceServerSettingPatchSchema, dataValidator)
const instanceServerSettingQueryValidator = getValidator(instanceServerSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(instanceServerSettingExternalResolver),
      schemaHooks.resolveResult(instanceServerSettingResolver)
    ]
  },

  before: {
    all: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateQuery(instanceServerSettingQueryValidator),
      schemaHooks.resolveQuery(instanceServerSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(instanceServerSettingDataValidator),
      schemaHooks.resolveData(instanceServerSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(instanceServerSettingPatchValidator),
      schemaHooks.resolveData(instanceServerSettingPatchResolver)
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
