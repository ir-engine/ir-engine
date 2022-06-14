import { CreateGroup, Group } from '@xrengine/common/src/interfaces/Group'
import { GroupResult } from '@xrengine/common/src/interfaces/GroupResult'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'

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

export const AdminGroupServiceReceptor = (action) => {
  getState(AdminGroupState).batch((s) => {
    matches(action)
      .when(AdminGroupAction.fetchingGroup.matches, (action) => {
        return s.merge({ fetching: true })
      })
      .when(AdminGroupAction.setAdminGroup.matches, (action) => {
        return s.merge({
          group: action.list.data,
          skip: action.list.skip,
          limit: action.list.limit,
          total: action.list.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      })
      .when(AdminGroupAction.updateGroup.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
      .when(AdminGroupAction.removeGroupAction.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
      .when(AdminGroupAction.addAdminGroup.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
  })
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
      dispatchAction(AdminGroupAction.fetchingGroup())
      const list = await client.service('group').find({
        query: {
          $sort: {
            ...sortData
          },
          $skip: skip * GROUP_PAGE_LIMIT,
          $limit: limit,
          search: search
        }
      })
      dispatchAction(AdminGroupAction.setAdminGroup({ list }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createGroupByAdmin: async (groupItem: CreateGroup) => {
    try {
      const newGroup = (await client.service('group').create({ ...groupItem })) as Group
      dispatchAction(AdminGroupAction.addAdminGroup({ item: newGroup }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchGroupByAdmin: async (groupId, groupItem) => {
    try {
      const group = (await client.service('group').patch(groupId, groupItem)) as Group
      dispatchAction(AdminGroupAction.updateGroup({ item: group }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  deleteGroupByAdmin: async (groupId) => {
    try {
      await client.service('group').remove(groupId)
      dispatchAction(AdminGroupAction.removeGroupAction({ item: groupId }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class AdminGroupAction {
  static fetchingGroup = defineAction({
    type: 'GROUP_FETCHING' as const
  })

  static setAdminGroup = defineAction({
    type: 'GROUP_ADMIN_RETRIEVED' as const,
    list: matches.object as Validator<unknown, GroupResult>
  })

  static addAdminGroup = defineAction({
    type: 'ADD_GROUP' as const,
    item: matches.object as Validator<unknown, Group>
  })

  static updateGroup = defineAction({
    type: 'GROUP_ADMIN_UPDATE' as const,
    item: matches.object as Validator<unknown, Group>
  })

  static removeGroupAction = defineAction({
    type: 'GROUP_ADMIN_DELETE' as const,
    item: matches.object as Validator<unknown, Group>
  })
}
