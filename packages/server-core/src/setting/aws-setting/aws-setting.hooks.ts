import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  awsCloudFrontSchema,
  awsKeysSchema,
  awsRoute53Schema,
  awsS3Schema,
  awsSettingDataSchema,
  awsSettingPatchSchema,
  awsSettingQuerySchema,
  awsSettingSchema,
  awsSmsSchema
} from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  awsSettingDataResolver,
  awsSettingExternalResolver,
  awsSettingPatchResolver,
  awsSettingQueryResolver,
  awsSettingResolver
} from './aws-setting.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const awsKeysValidator = getValidator(awsKeysSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const awsRoute53Validator = getValidator(awsRoute53Schema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const awsS3Validator = getValidator(awsS3Schema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const awsCloudFrontValidator = getValidator(awsCloudFrontSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const awsSmsValidator = getValidator(awsSmsSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const awsSettingValidator = getValidator(awsSettingSchema, dataValidator)
const awsSettingDataValidator = getValidator(awsSettingDataSchema, dataValidator)
const awsSettingPatchValidator = getValidator(awsSettingPatchSchema, dataValidator)
const awsSettingQueryValidator = getValidator(awsSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(awsSettingExternalResolver), schemaHooks.resolveResult(awsSettingResolver)]
  },

  before: {
    all: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateQuery(awsSettingQueryValidator),
      schemaHooks.resolveQuery(awsSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(awsSettingDataValidator),
      schemaHooks.resolveData(awsSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(awsSettingPatchValidator),
      schemaHooks.resolveData(awsSettingPatchResolver)
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
