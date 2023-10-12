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

import inviteRemoveAuthenticate from '@etherealengine/server-core/src/hooks/invite-remove-authenticate'
import attachOwnerIdInBody from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-query'
import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  inviteDataValidator,
  invitePatchValidator,
  inviteQueryValidator
} from '@etherealengine/engine/src/schemas/social/invite.schema'
import verifyScope from '../../hooks/verify-scope'
import {
  inviteDataResolver,
  inviteExternalResolver,
  invitePatchResolver,
  inviteQueryResolver,
  inviteResolver
} from './invite.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(inviteExternalResolver), schemaHooks.resolveResult(inviteResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(inviteQueryValidator), schemaHooks.resolveQuery(inviteQueryResolver)],
    find: [attachOwnerIdInQuery('userId')],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    create: [
      attachOwnerIdInBody('userId'),
      () => schemaHooks.validateData(inviteDataValidator),
      schemaHooks.resolveData(inviteDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin'))],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateData(invitePatchValidator),
      schemaHooks.resolveData(invitePatchResolver)
    ],
    remove: [iff(isProvider('external'), inviteRemoveAuthenticate())]
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
