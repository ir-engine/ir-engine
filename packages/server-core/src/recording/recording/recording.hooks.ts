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

import { UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { HookContext } from '@feathersjs/feathers'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

// TODO: Populating Message's sender property here manually. Once message service is moved to feathers 5. This should be part of its resolver.
const populateUsers = async (context: HookContext) => {
  const { result } = context

  const data = result.data ? result.data : result

  const senderIds = data.filter((item) => item.senderId).map((item) => item.senderId)

  if (senderIds.length > 0) {
    //@ts-ignore
    const users = (await context.app.service(userPath)._find({
      query: {
        id: {
          $in: senderIds
        }
      },
      paginate: false
    })) as any as UserType[]

    for (const message of data) {
      if (message.senderId && !message.sender) {
        message.sender = users.find((user) => user.id === message.senderId)
      }
    }
  }
}

// TODO: Populating Message's sender property here manually. Once message service is moved to feathers 5. This should be part of its resolver.
const populateUser = async (context: HookContext) => {
  const { result } = context

  if (result.senderId && !result.sender) {
    //@ts-ignore
    result.sender = (await context.app.service(userPath)._get(result.senderId)) as UserType
  }
}

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), verifyScope('recording', 'read'))],
    get: [iff(isProvider('external'), verifyScope('recording', 'read') as any)],
    create: [iff(isProvider('external'), verifyScope('recording', 'write'))],
    update: [iff(isProvider('external'), verifyScope('recording', 'write') as any)],
    patch: [iff(isProvider('external'), verifyScope('recording', 'write') as any)],
    remove: [iff(isProvider('external'), verifyScope('recording', 'write') as any)]
  },

  after: {
    all: [],
    find: [populateUsers],
    get: [],
    create: [populateUser],
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
