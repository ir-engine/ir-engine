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

import { CreateEditUser, UserInterface, UserSeed } from '@etherealengine/common/src/interfaces/User'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { AuthService, AuthState } from '../../user/services/AuthService'

export const USER_PAGE_LIMIT = 10
export const AdminUserState = defineState({
  name: 'AdminUserState',
  initial: () => ({
    users: [] as Array<UserInterface>,
    singleUser: UserSeed as UserInterface,
    skip: 0,
    limit: USER_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    skipGuests: false,
    lastFetched: 0
  })
})

export const AdminUserService = {
  fetchSingleUserAdmin: async (id: string) => {
    try {
      const result = await Engine.instance.api.service('user').get(id)
      getMutableState(AdminUserState).merge({ singleUser: result, updateNeeded: false })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchUsersAsAdmin: async (value: string | null = null, skip = 0, sortField = 'name', orderBy = 'asc') => {
    const userState = getMutableState(AdminUserState)
    const user = getMutableState(AuthState).user
    const skipGuests = userState.skipGuests.value
    try {
      if (user.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
        let sortData = {}

        if (sortField.length > 0) {
          sortData[sortField] = orderBy === 'desc' ? 0 : 1
        }

        const params = {
          query: {
            $sort: {
              ...sortData
            },
            $skip: skip * USER_PAGE_LIMIT,
            $limit: USER_PAGE_LIMIT,
            action: 'admin',
            search: value
          }
        }
        if (skipGuests) {
          ;(params.query as any).isGuest = false
        }
        const userResult = (await Engine.instance.api.service('user').find(params)) as Paginated<UserInterface>

        getMutableState(AdminUserState).merge({
          users: userResult.data,
          skip: userResult.skip,
          limit: userResult.limit,
          total: userResult.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createUser: async (user: CreateEditUser) => {
    try {
      await Engine.instance.api.service('user').create(user)
      getMutableState(AdminUserState).merge({
        updateNeeded: true
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchUser: async (id: string, user: CreateEditUser) => {
    try {
      await Engine.instance.api.service('user').patch(id, user)
      getMutableState(AdminUserState).merge({
        updateNeeded: true
      })
      if (id === getMutableState(AuthState).user.id.value) await AuthService.loadUserData(id)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeUserAdmin: async (id: string) => {
    await Engine.instance.api.service('user').remove(id)
    getMutableState(AdminUserState).merge({ updateNeeded: true })
  },
  setSkipGuests: async (skipGuests: boolean) => {
    getMutableState(AdminUserState).merge({ skipGuests, updateNeeded: true })
  },
  resetFilter: () => {
    getMutableState(AdminUserState).merge({ skipGuests: false, updateNeeded: true })
  }
}
