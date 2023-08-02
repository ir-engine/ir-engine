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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { ChannelID } from '@etherealengine/common/src/dbmodels/Channel'
import { Channel, PatchChannel } from '@etherealengine/engine/src/schemas/interfaces/Channel'
import { NotificationService } from '../../common/services/NotificationService'
import { userIsAdmin } from '../../user/userHasAccess'

export const CHANNEL_PAGE_LIMIT = 100

export const AdminChannelState = defineState({
  name: 'AdminChannelState',
  initial: () => ({
    channels: [] as Array<Channel>,
    skip: 0,
    limit: CHANNEL_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const AdminChannelService = {
  createAdminChannel: async (data) => {
    try {
      await Engine.instance.api.service('channel').create(data)
      getMutableState(AdminChannelState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchAdminChannel: async (value: string | null = null, skip = 0, sortField = '', orderBy = 'asc') => {
    try {
      if (userIsAdmin()) {
        const sortData = sortField.length > 0 ? { [sortField]: orderBy === 'desc' ? 0 : 1 } : {}
        const channels = (await Engine.instance.api.service('channel').find({
          query: {
            $sort: {
              ...sortData
            },
            $skip: skip * CHANNEL_PAGE_LIMIT,
            $limit: CHANNEL_PAGE_LIMIT,
            action: 'admin',
            search: value
          }
        })) as Paginated<Channel>

        getMutableState(AdminChannelState).merge({
          channels: channels.data,
          updateNeeded: false,
          skip: channels.skip,
          limit: channels.limit,
          total: channels.total,
          fetched: true,
          lastFetched: Date.now()
        })
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeChannel: async (id: ChannelID) => {
    await Engine.instance.api.service('channel').remove(id)
    getMutableState(AdminChannelState).merge({ updateNeeded: true })
  },
  patchChannel: async (id: string, channel: PatchChannel) => {
    try {
      await Engine.instance.api.service('channel').patch(id, channel)
      getMutableState(AdminChannelState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
