import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  taskServerSettingDataSchema,
  taskServerSettingPatchSchema,
  taskServerSettingQuerySchema,
  taskServerSettingSchema
} from '@etherealengine/engine/src/schemas/setting/task-server-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  taskServerSettingDataResolver,
  taskServerSettingExternalResolver,
  taskServerSettingPatchResolver,
  taskServerSettingQueryResolver,
  taskServerSettingResolver
} from './task-server-setting.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const taskServerSettingValidator = getValidator(taskServerSettingSchema, dataValidator)
const taskServerSettingDataValidator = getValidator(taskServerSettingDataSchema, dataValidator)
const taskServerSettingPatchValidator = getValidator(taskServerSettingPatchSchema, dataValidator)
const taskServerSettingQueryValidator = getValidator(taskServerSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(taskServerSettingExternalResolver),
      schemaHooks.resolveResult(taskServerSettingResolver)
    ]
  },

  before: {
    all: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(taskServerSettingQueryValidator),
      schemaHooks.resolveQuery(taskServerSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(taskServerSettingDataValidator),
      schemaHooks.resolveData(taskServerSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(taskServerSettingPatchValidator),
      schemaHooks.resolveData(taskServerSettingPatchResolver)
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
