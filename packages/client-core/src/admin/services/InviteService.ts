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

import { Paginated } from '@feathersjs/feathers'

import { Invite as InviteInterface } from '@etherealengine/common/src/interfaces/Invite'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

export const INVITE_PAGE_LIMIT = 100

export const AdminInviteState = defineState({
  name: 'AdminInviteState',
  initial: () => ({
    invites: [] as Array<InviteInterface>,
    skip: 0,
    limit: INVITE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    created: false,
    lastFetched: Date.now()
  })
})

export const AdminInviteService = {
  updateInvite: async (id: string, invite: InviteInterface) => {
    try {
      await Engine.instance.api.service('invite').update(id, invite)
      getMutableState(AdminInviteState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeInvite: async (id: string) => {
    await Engine.instance.api.service('invite').remove(id)
    getMutableState(AdminInviteState).merge({ updateNeeded: true })
  },
  createInvite: async (invite: any) => {
    try {
      await Engine.instance.api.service('invite').create(invite)
      getMutableState(AdminInviteState).merge({ updateNeeded: true, created: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchAdminInvites: async (search?: string, page = 0, sortField = 'id', orderBy = 'asc') => {
    getMutableState(AdminInviteState).merge({ retrieving: true, fetched: false })
    try {
      const adminInviteState = getMutableState(AdminInviteState)
      const limit = adminInviteState.limit.value
      const skip = page * limit
      let sortData = {}
      if (sortField.length > 0) {
        if (sortField === 'type') {
          sortData['inviteType'] = orderBy === 'desc' ? -1 : 1
        } else if (sortField === 'name') {
          // TO DO; need to find the proper syntax if that's possible
          // sortData[`'user.name'`] = orderBy === 'desc' ? -1 : 1
        } else {
          sortData[sortField] = orderBy === 'desc' ? -1 : 1
        }
      }
      const invites = (await Engine.instance.api.service('invite').find({
        query: {
          $sort: {
            ...sortData
          },
          $skip: skip * INVITE_PAGE_LIMIT,
          $limit: limit
          // search /** @todo reimplement invite search */
        }
      })) as Paginated<InviteInterface>
      getMutableState(AdminInviteState).merge({
        invites: invites.data,
        skip: invites.skip,
        limit: invites.limit,
        total: invites.total,
        retrieving: false,
        fetched: true,
        updateNeeded: false,
        lastFetched: Date.now()
      })
    } catch (error) {
      NotificationService.dispatchNotify(error.message, { variant: 'error' })
    }
  }
}
