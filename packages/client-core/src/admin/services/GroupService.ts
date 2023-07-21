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

import { CreateGroup, Group } from '@etherealengine/common/src/interfaces/Group'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

export const GROUP_PAGE_LIMIT = 100

export const AdminGroupState = defineState({
  name: 'AdminGroupState',
  initial: () => ({
    group: [] as Array<Group>,
    skip: 0,
    limit: GROUP_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now(),
    fetching: false
  })
})

export const AdminGroupService = {
  getGroupService: async (search: string | null = null, skip = 0, sortField = 'name', orderBy = 'asc') => {
    getMutableState(AdminGroupState).merge({ fetching: true })
    const limit = getMutableState(AdminGroupState).limit.value
    try {
      const sortData = sortField.length ? { [sortField]: orderBy === 'desc' ? 0 : 1 } : {}
      const fetchedAdminGroups = await Engine.instance.api.service('group').find({
        query: {
          $sort: {
            ...sortData
          },
          $skip: skip * GROUP_PAGE_LIMIT,
          $limit: limit,
          search: search
        }
      })
      getMutableState(AdminGroupState).merge({
        group: fetchedAdminGroups.data,
        skip: fetchedAdminGroups.skip,
        limit: fetchedAdminGroups.limit,
        total: fetchedAdminGroups.total,
        retrieving: false,
        fetched: true,
        updateNeeded: false,
        lastFetched: Date.now()
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
      getMutableState(AdminGroupState).merge({ fetching: false })
    }
  },
  createGroupByAdmin: async (groupItem: CreateGroup) => {
    try {
      await Engine.instance.api.service('group').create({ ...groupItem })
      getMutableState(AdminGroupState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchGroupByAdmin: async (groupId, groupItem) => {
    try {
      await Engine.instance.api.service('group').patch(groupId, groupItem)
      getMutableState(AdminGroupState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  deleteGroupByAdmin: async (groupId) => {
    try {
      await Engine.instance.api.service('group').remove(groupId)
      getMutableState(AdminGroupState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
