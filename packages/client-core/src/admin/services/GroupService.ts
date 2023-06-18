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
import { GroupResult } from '@etherealengine/common/src/interfaces/GroupResult'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
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

const fetchingGroupReceptor = (action: typeof AdminGroupActions.fetchingGroup.matches._TYPE) => {
  const state = getMutableState(AdminGroupState)
  return state.merge({ fetching: true })
}

const setAdminGroupReceptor = (action: typeof AdminGroupActions.setAdminGroup.matches._TYPE) => {
  const state = getMutableState(AdminGroupState)
  return state.merge({
    group: action.list.data,
    skip: action.list.skip,
    limit: action.list.limit,
    total: action.list.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const updateGroupReceptor = (action: typeof AdminGroupActions.updateGroup.matches._TYPE) => {
  const state = getMutableState(AdminGroupState)
  return state.merge({ updateNeeded: true })
}

const removeGroupActionReceptor = (action: typeof AdminGroupActions.removeGroupAction.matches._TYPE) => {
  const state = getMutableState(AdminGroupState)
  return state.merge({ updateNeeded: true })
}

const addAdminGroupReceptor = (action: typeof AdminGroupActions.addAdminGroup.matches._TYPE) => {
  const state = getMutableState(AdminGroupState)
  return state.merge({ updateNeeded: true })
}

export const AdminGroupServiceReceptors = {
  fetchingGroupReceptor,
  setAdminGroupReceptor,
  updateGroupReceptor,
  removeGroupActionReceptor,
  addAdminGroupReceptor
}

//Service
export const AdminGroupService = {
  getGroupService: async (search: string | null = null, skip = 0, sortField = 'name', orderBy = 'asc') => {
    const limit = getMutableState(AdminGroupState).limit.value
    try {
      let sortData = {}

      if (sortField.length > 0) {
        sortData[sortField] = orderBy === 'desc' ? 0 : 1
      }
      dispatchAction(AdminGroupActions.fetchingGroup({}))
      const list = await API.instance.client.service('group').find({
        query: {
          $sort: {
            ...sortData
          },
          $skip: skip * GROUP_PAGE_LIMIT,
          $limit: limit,
          search: search
        }
      })
      dispatchAction(AdminGroupActions.setAdminGroup({ list }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createGroupByAdmin: async (groupItem: CreateGroup) => {
    try {
      const newGroup = (await API.instance.client.service('group').create({ ...groupItem })) as Group
      dispatchAction(AdminGroupActions.addAdminGroup({ item: newGroup }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchGroupByAdmin: async (groupId, groupItem) => {
    try {
      const group = (await API.instance.client.service('group').patch(groupId, groupItem)) as Group
      dispatchAction(AdminGroupActions.updateGroup({ item: group }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  deleteGroupByAdmin: async (groupId) => {
    try {
      await API.instance.client.service('group').remove(groupId)
      dispatchAction(AdminGroupActions.removeGroupAction({ item: groupId }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class AdminGroupActions {
  static fetchingGroup = defineAction({
    type: 'ee.client.AdminGroup.GROUP_FETCHING' as const
  })

  static setAdminGroup = defineAction({
    type: 'ee.client.AdminGroup.GROUP_ADMIN_RETRIEVED' as const,
    list: matches.object as Validator<unknown, GroupResult>
  })

  static addAdminGroup = defineAction({
    type: 'ee.client.AdminGroup.ADD_GROUP' as const,
    item: matches.object as Validator<unknown, Group>
  })

  static updateGroup = defineAction({
    type: 'ee.client.AdminGroup.GROUP_ADMIN_UPDATE' as const,
    item: matches.object as Validator<unknown, Group>
  })

  static removeGroupAction = defineAction({
    type: 'ee.client.AdminGroup.GROUP_ADMIN_DELETE' as const,
    item: matches.object as Validator<unknown, Group>
  })
}
