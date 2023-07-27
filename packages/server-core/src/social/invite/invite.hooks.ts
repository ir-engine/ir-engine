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

import addAssociations from '../../hooks/add-associations'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [
      authenticate(),
      attachOwnerIdInQuery('userId'),
      addAssociations({
        models: [
          {
            model: 'user',
            as: 'user'
          }
        ]
      })
    ],
    get: [
      iff(isProvider('external'), authenticate() as any, attachOwnerIdInQuery('userId') as any),
      addAssociations({
        models: [
          {
            model: 'user',
            as: 'user'
          }
        ]
      })
    ],
    create: [authenticate(), attachOwnerIdInBody('userId')],
    update: [iff(isProvider('external'), authenticate() as any, verifyScope('admin', 'admin') as any)],
    patch: [iff(isProvider('external'), authenticate() as any, verifyScope('admin', 'admin') as any)],
    remove: [authenticate(), iff(isProvider('external'), inviteRemoveAuthenticate() as any)]
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
