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
import { UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { HookContext } from '@feathersjs/feathers'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  inviteDataResolver,
  inviteExternalResolver,
  invitePatchResolver,
  inviteQueryResolver,
  inviteResolver
} from './invite.resolvers'

// TODO: Populating Invite's user property here manually. Once invite service is moved to feathers 5. This should be part of its resolver.
const populateUsers = async (context: HookContext) => {
  const { result } = context

  const data = result.data ? result.data : result

  const userIds = data.filter((item) => item.userId).map((item) => item.userId)

  if (userIds.length > 0) {
    //@ts-ignore
    const users = (await context.app.service(userPath)._find({
      query: {
        id: {
          $in: userIds
        }
      },
      paginate: false
    })) as any as UserType[]

    for (const invite of data) {
      if (invite.userId && !invite.user) {
        invite.user = users.find((user) => user.id === invite.userId)
      }
    }
  }
}

// TODO: Populating Invite's user property here manually. Once invite service is moved to feathers 5. This should be part of its resolver.
const populateUser = async (context: HookContext) => {
  const { result } = context

  if (result.userId && !result.user) {
    //@ts-ignore
    result.user = (await context.app.service(userPath)._get(result.userId)) as UserType
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(inviteExternalResolver), schemaHooks.resolveResult(inviteResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(inviteQueryValidator), schemaHooks.resolveQuery(inviteQueryResolver)],
    find: [authenticate(), attachOwnerIdInQuery('userId')],
    get: [iff(isProvider('external'), authenticate() as any, attachOwnerIdInQuery('userId'))],
    create: [
      authenticate(),
      attachOwnerIdInBody('userId'),
      () => schemaHooks.validateData(inviteDataValidator),
      schemaHooks.resolveData(inviteDataResolver)
    ],
    update: [iff(isProvider('external'), authenticate() as any, verifyScope('admin', 'admin'))],
    patch: [
      iff(isProvider('external'), authenticate() as any, verifyScope('admin', 'admin')),
      () => schemaHooks.validateData(invitePatchValidator),
      schemaHooks.resolveData(invitePatchResolver)
    ],
    remove: [authenticate(), iff(isProvider('external'), inviteRemoveAuthenticate())]
  },

  after: {
    all: [],
    find: [populateUsers],
    get: [populateUser],
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
