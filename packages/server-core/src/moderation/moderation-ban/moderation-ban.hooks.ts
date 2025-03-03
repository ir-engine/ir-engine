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
import {
  moderationBanDataValidator,
  moderationBanPatchValidator,
  moderationBanQueryValidator
} from '@ir-engine/common/src/schemas/moderation/moderation-ban.schema'
import {
  moderationBanDataResolver,
  moderationBanExternalResolver,
  moderationBanPatchResolver,
  moderationBanQueryResolver,
  moderationBanResolver
} from './moderation-ban.resolvers'

import verifyScope from '@ir-engine/server-core/src/hooks/verify-scope'
import { discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'
import isAction from '../../hooks/is-action'
import persistQuery from '../../hooks/persist-query'
import setLoggedinUserInQuery from '../../hooks/set-loggedin-user-in-query'

export default {
  around: {
    all: [schemaHooks.resolveExternal(moderationBanExternalResolver), schemaHooks.resolveResult(moderationBanResolver)]
  },
  before: {
    all: [schemaHooks.validateQuery(moderationBanQueryValidator), schemaHooks.resolveQuery(moderationBanQueryResolver)],
    find: [
      persistQuery,
      iff(
        isProvider('external'),
        iffElse(isAction('admin'), verifyScope('moderation', 'read'), setLoggedinUserInQuery('banUserId')),
        discardQuery('action')
      )
    ],
    get: [
      persistQuery,
      iff(
        isProvider('external'),
        iffElse(isAction('admin'), verifyScope('moderation', 'read'), setLoggedinUserInQuery('banUserId')),
        discardQuery('action')
      )
    ],
    create: [
      iff(isProvider('external'), verifyScope('moderation', 'write')),
      schemaHooks.validateData(moderationBanDataValidator),
      schemaHooks.resolveData(moderationBanDataResolver)
    ],
    patch: [
      iff(isProvider('external'), verifyScope('moderation', 'write')),
      schemaHooks.validateData(moderationBanPatchValidator),
      schemaHooks.resolveData(moderationBanPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('moderation', 'write'))]
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
    all: []
  }
} as any
