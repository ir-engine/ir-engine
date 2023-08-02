/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  authAppCredentialsSchema,
  authBearerTokenSchema,
  authCallbackSchema,
  authDefaultsSchema,
  authenticationSettingDataSchema,
  authenticationSettingPatchSchema,
  authenticationSettingQuerySchema,
  authenticationSettingSchema,
  authJwtOptionsSchema,
  authOauthSchema,
  authStrategiesSchema
} from '@etherealengine/engine/src/schemas/setting/authentication-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  authenticationSettingDataResolver,
  authenticationSettingExternalResolver,
  authenticationSettingPatchResolver,
  authenticationSettingQueryResolver,
  authenticationSettingResolver
} from './authentication-setting.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authAppCredentialsValidator = getValidator(authAppCredentialsSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authBearerTokenValidator = getValidator(authBearerTokenSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authCallbackValidator = getValidator(authCallbackSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authDefaultsValidator = getValidator(authDefaultsSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authJwtOptionsValidator = getValidator(authJwtOptionsSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authOauthValidator = getValidator(authOauthSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authStrategiesValidator = getValidator(authStrategiesSchema, dataValidator)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authenticationSettingValidator = getValidator(authenticationSettingSchema, dataValidator)
const authenticationSettingDataValidator = getValidator(authenticationSettingDataSchema, dataValidator)
const authenticationSettingPatchValidator = getValidator(authenticationSettingPatchSchema, dataValidator)
const authenticationSettingQueryValidator = getValidator(authenticationSettingQuerySchema, queryValidator)

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(authenticationSettingExternalResolver),
      schemaHooks.resolveResult(authenticationSettingResolver)
    ]
  },

  before: {
    all: [
      authenticate(),
      () => schemaHooks.validateQuery(authenticationSettingQueryValidator),
      schemaHooks.resolveQuery(authenticationSettingQueryResolver)
    ],
    find: [],
    get: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(authenticationSettingDataValidator),
      schemaHooks.resolveData(authenticationSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(authenticationSettingPatchValidator),
      schemaHooks.resolveData(authenticationSettingPatchResolver)
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
} as any
