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

import { AvatarInterface } from '@etherealengine/common/src/interfaces/AvatarInterface'
import { AvatarResult } from '@etherealengine/common/src/interfaces/AvatarResult'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:AvatarService' })

//State
export const AVATAR_PAGE_LIMIT = 100

export const AdminAvatarState = defineState({
  name: 'AdminAvatarState',
  initial: () => ({
    avatars: [] as Array<AvatarInterface>,
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

const avatarsFetchedReceptor = (action: typeof AdminAvatarActions.avatarsFetched.matches._TYPE) => {
  const state = getMutableState(AdminAvatarState)
  return state.merge({
    avatars: action.avatars.data,
    skip: action.avatars.skip,
    limit: action.avatars.limit,
    total: action.avatars.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const avatarCreatedReceptor = (action: typeof AdminAvatarActions.avatarCreated.matches._TYPE) => {
  const state = getMutableState(AdminAvatarState)
  return state.merge({ updateNeeded: true })
}

const avatarRemovedReceptor = (action: typeof AdminAvatarActions.avatarRemoved.matches._TYPE) => {
  const state = getMutableState(AdminAvatarState)
  return state.merge({ updateNeeded: true })
}

const avatarUpdatedReceptor = (action: typeof AdminAvatarActions.avatarUpdated.matches._TYPE) => {
  const state = getMutableState(AdminAvatarState)
  return state.merge({ updateNeeded: true })
}

export const AdminAvatarReceptors = {
  avatarsFetchedReceptor,
  avatarCreatedReceptor,
  avatarRemovedReceptor,
  avatarUpdatedReceptor
}

//Service
export const AdminAvatarService = {
  fetchAdminAvatars: async (skip = 0, search: string | null = null, sortField = 'name', orderBy = 'asc') => {
    let sortData = {}
    if (sortField.length > 0) {
      sortData[sortField] = orderBy === 'desc' ? 0 : 1
    }
    const adminAvatarState = getMutableState(AdminAvatarState)
    const limit = adminAvatarState.limit.value
    const avatars = (await API.instance.client.service('avatar').find({
      query: {
        admin: true,
        $sort: {
          ...sortData
        },
        $limit: limit,
        $skip: skip * AVATAR_PAGE_LIMIT,
        search: search
      }
    })) as Paginated<AvatarInterface>
    dispatchAction(AdminAvatarActions.avatarsFetched({ avatars }))
  },
  removeAdminAvatar: async (id: string) => {
    try {
      await API.instance.client.service('avatar').remove(id)
      dispatchAction(AdminAvatarActions.avatarRemoved({}))
    } catch (err) {
      logger.error(err)
    }
  }
}

//Action
export class AdminAvatarActions {
  static avatarsFetched = defineAction({
    type: 'ee.client.AdminAvatar.AVATARS_RETRIEVED' as const,
    avatars: matches.object as Validator<unknown, AvatarResult>
  })

  static avatarCreated = defineAction({
    type: 'ee.client.AdminAvatar.AVATAR_CREATED' as const
  })

  static avatarRemoved = defineAction({
    type: 'ee.client.AdminAvatar.AVATAR_REMOVED' as const
  })

  static avatarUpdated = defineAction({
    type: 'ee.client.AdminAvatar.AVATAR_UPDATED' as const
  })
}
