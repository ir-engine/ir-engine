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
import { iff, isProvider } from 'feathers-hooks-common'

import {
  matchUserDataSchema,
  matchUserPatchSchema,
  matchUserQuerySchema,
  matchUserSchema
} from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import setLoggedInUserInQuery from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-query'

import { dataValidator, queryValidator } from '@etherealengine/engine/src/schemas/validators'
import { getValidator } from '@feathersjs/typebox'
import {
  matchUserDataResolver,
  matchUserExternalResolver,
  matchUserPatchResolver,
  matchUserQueryResolver,
  matchUserResolver
} from './match-user.resolvers'

const matchUserValidator = getValidator(matchUserSchema, dataValidator)
const matchUserDataValidator = getValidator(matchUserDataSchema, dataValidator)
const matchUserPatchValidator = getValidator(matchUserPatchSchema, dataValidator)
const matchUserQueryValidator = getValidator(matchUserQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(matchUserExternalResolver), schemaHooks.resolveResult(matchUserResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(matchUserQueryValidator), schemaHooks.resolveQuery(matchUserQueryResolver)],
    find: [iff(isProvider('external'), setLoggedInUserInQuery('userId') as any)],
    get: [],
    create: [
      iff(isProvider('external'), setLoggedInUser('userId') as any),
      () => schemaHooks.validateData(matchUserDataValidator),
      schemaHooks.resolveData(matchUserDataResolver)
    ],
    update: [],
    patch: [() => schemaHooks.validateData(matchUserPatchValidator), schemaHooks.resolveData(matchUserPatchResolver)],
    remove: []
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
