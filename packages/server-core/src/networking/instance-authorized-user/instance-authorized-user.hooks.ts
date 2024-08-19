/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import {
  instanceAuthorizedUserDataValidator,
  instanceAuthorizedUserPatchValidator,
  instanceAuthorizedUserQueryValidator
} from '@ir-engine/common/src/schemas/networking/instance-authorized-user.schema'

import {
  instanceAuthorizedUserDataResolver,
  instanceAuthorizedUserExternalResolver,
  instanceAuthorizedUserPatchResolver,
  instanceAuthorizedUserQueryResolver,
  instanceAuthorizedUserResolver
} from './instance-authorized-user.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(instanceAuthorizedUserExternalResolver),
      schemaHooks.resolveResult(instanceAuthorizedUserResolver)
    ]
  },

  before: {
    all: [
      disallow('external'),
      () => schemaHooks.validateQuery(instanceAuthorizedUserQueryValidator),
      schemaHooks.resolveQuery(instanceAuthorizedUserQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      () => schemaHooks.validateData(instanceAuthorizedUserDataValidator),
      schemaHooks.resolveData(instanceAuthorizedUserDataResolver)
    ],
    update: [],
    patch: [
      () => schemaHooks.validateData(instanceAuthorizedUserPatchValidator),
      schemaHooks.resolveData(instanceAuthorizedUserPatchResolver)
    ],
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
