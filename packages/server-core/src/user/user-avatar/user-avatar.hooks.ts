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
import { disallow, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  userAvatarDataValidator,
  userAvatarPatchValidator,
  userAvatarQueryValidator
} from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { checkScope } from '@ir-engine/spatial/src/common/functions/checkScope'

import setLoggedinUserInQuery from '../../hooks/set-loggedin-user-in-query'
import {
  userAvatarDataResolver,
  userAvatarExternalResolver,
  userAvatarPatchResolver,
  userAvatarQueryResolver,
  userAvatarResolver
} from './user-avatar.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(userAvatarExternalResolver), schemaHooks.resolveResult(userAvatarResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(userAvatarQueryValidator), schemaHooks.resolveQuery(userAvatarQueryResolver)],
    find: [],
    get: [disallow('external')],
    create: [
      disallow('external'),
      schemaHooks.validateData(userAvatarDataValidator),
      schemaHooks.resolveData(userAvatarDataResolver)
    ],
    patch: [
      iff(
        isProvider('external'),
        iffElse(
          async (context) => await checkScope(context.params.user, 'user', 'write'),
          [],
          [setLoggedinUserInQuery('userId')]
        )
      ),
      schemaHooks.validateData(userAvatarPatchValidator),
      schemaHooks.resolveData(userAvatarPatchResolver)
    ],
    remove: [disallow('external')]
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
