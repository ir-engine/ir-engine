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

import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { avatarPath, AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

const logger = multiLogger.child({ component: 'client-core:AvatarService' })

export const AVATAR_PAGE_LIMIT = 100

export const AdminAvatarState = defineState({
  name: 'AdminAvatarState',
  initial: () => ({
    avatars: [] as Array<AvatarType>,
    thumbnail: undefined as StaticResourceInterface | undefined,
    skip: 0,
    limit: AVATAR_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const AdminAvatarService = {
  fetchAdminAvatars: async (skip = 0, search: string | undefined = undefined, sortField = 'name', orderBy = 'asc') => {
    const sortData = {}
    if (sortField.length > 0) {
      sortData[sortField] = orderBy === 'desc' ? -1 : 1
    }
    const adminAvatarState = getMutableState(AdminAvatarState)
    const limit = adminAvatarState.limit.value
    const avatars = (await Engine.instance.api.service(avatarPath).find({
      query: {
        admin: true,
        $sort: {
          ...sortData
        },
        $limit: limit,
        $skip: skip * AVATAR_PAGE_LIMIT,
        search: search
      }
    })) as Paginated<AvatarType>
    getMutableState(AdminAvatarState).merge({
      avatars: avatars.data,
      skip: avatars.skip,
      limit: avatars.limit,
      total: avatars.total,
      retrieving: false,
      fetched: true,
      updateNeeded: false,
      lastFetched: Date.now()
    })
  },
  removeAdminAvatar: async (id: string) => {
    try {
      await Engine.instance.api.service(avatarPath).remove(id)
      getMutableState(AdminAvatarState).merge({ updateNeeded: true })
    } catch (err) {
      logger.error(err)
    }
  }
}
