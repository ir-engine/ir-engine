import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  redisSettingDataSchema,
  redisSettingPatchSchema,
  redisSettingQuerySchema,
  redisSettingSchema
} from '@etherealengine/engine/src/schemas/setting/redis-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  redisSettingDataResolver,
  redisSettingExternalResolver,
  redisSettingPatchResolver,
  redisSettingQueryResolver,
  redisSettingResolver
} from './redis-setting.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const redisSettingValidator = getValidator(redisSettingSchema, dataValidator)
const redisSettingDataValidator = getValidator(redisSettingDataSchema, dataValidator)
const redisSettingPatchValidator = getValidator(redisSettingPatchSchema, dataValidator)
const redisSettingQueryValidator = getValidator(redisSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(redisSettingExternalResolver), schemaHooks.resolveResult(redisSettingResolver)]
  },

  before: {
    all: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateQuery(redisSettingQueryValidator),
      schemaHooks.resolveQuery(redisSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(redisSettingDataValidator),
      schemaHooks.resolveData(redisSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(redisSettingPatchValidator),
      schemaHooks.resolveData(redisSettingPatchResolver)
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
