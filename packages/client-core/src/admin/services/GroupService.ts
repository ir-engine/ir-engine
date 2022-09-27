import { CreateGroup, Group } from '@xrengine/common/src/interfaces/Group'
import { GroupResult } from '@xrengine/common/src/interfaces/GroupResult'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
export const GROUP_PAGE_LIMIT = 100

const AdminGroupState = defineState({
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
  const state = getState(AdminGroupState)
  return state.merge({ fetching: true })
}

const setAdminGroupReceptor = (action: typeof AdminGroupActions.setAdminGroup.matches._TYPE) => {
  const state = getState(AdminGroupState)
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
  const state = getState(AdminGroupState)
  return state.merge({ updateNeeded: true })
}

const removeGroupActionReceptor = (action: typeof AdminGroupActions.removeGroupAction.matches._TYPE) => {
  const state = getState(AdminGroupState)
  return state.merge({ updateNeeded: true })
}

const addAdminGroupReceptor = (action: typeof AdminGroupActions.addAdminGroup.matches._TYPE) => {
  const state = getState(AdminGroupState)
  return state.merge({ updateNeeded: true })
}

export const AdminGroupServiceReceptors = {
  fetchingGroupReceptor,
  setAdminGroupReceptor,
  updateGroupReceptor,
  removeGroupActionReceptor,
  addAdminGroupReceptor
}

export const accessAdminGroupState = () => getState(AdminGroupState)

export const useAdminGroupState = () => useState(accessAdminGroupState())

//Service
export const AdminGroupService = {
  getGroupService: async (search: string | null = null, skip = 0, sortField = 'name', orderBy = 'asc') => {
    const limit = accessAdminGroupState().limit.value
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
    type: 'xre.client.AdminGroup.GROUP_FETCHING' as const
  })

  static setAdminGroup = defineAction({
    type: 'xre.client.AdminGroup.GROUP_ADMIN_RETRIEVED' as const,
    list: matches.object as Validator<unknown, GroupResult>
  })

  static addAdminGroup = defineAction({
    type: 'xre.client.AdminGroup.ADD_GROUP' as const,
    item: matches.object as Validator<unknown, Group>
  })

  static updateGroup = defineAction({
    type: 'xre.client.AdminGroup.GROUP_ADMIN_UPDATE' as const,
    item: matches.object as Validator<unknown, Group>
  })

  static removeGroupAction = defineAction({
    type: 'xre.client.AdminGroup.GROUP_ADMIN_DELETE' as const,
    item: matches.object as Validator<unknown, Group>
  })
}
