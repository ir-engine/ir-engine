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

import { iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '@etherealengine/server-core/src/hooks/verify-scope'

import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'
import authenticate from '../../hooks/authenticate'

import {
  locationDataSchema,
  locationPatchSchema,
  locationQuerySchema,
  locationSchema
} from '@etherealengine/engine/src/schemas/social/location.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import {
  locationDataResolver,
  locationExternalResolver,
  locationPatchResolver,
  locationQueryResolver,
  locationResolver
} from './location.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const locationValidator = getValidator(locationSchema, dataValidator)
const locationDataValidator = getValidator(locationDataSchema, dataValidator)
const locationPatchValidator = getValidator(locationPatchSchema, dataValidator)
const locationQueryValidator = getValidator(locationQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(locationExternalResolver), schemaHooks.resolveResult(locationResolver)]
  },

  before: {
    all: [
      authenticate(),
      () => schemaHooks.validateQuery(locationQueryValidator),
      schemaHooks.resolveQuery(locationQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      () => schemaHooks.validateData(locationDataValidator),
      schemaHooks.resolveData(locationDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('location', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      () => schemaHooks.validateData(locationPatchValidator),
      schemaHooks.resolveData(locationPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('location', 'write'))]
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
