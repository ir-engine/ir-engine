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

import { none } from '@hookstate/core'
import { useEffect } from 'react'

import { CreateGroup, Group } from '@etherealengine/common/src/interfaces/Group'
import { GroupUser } from '@etherealengine/common/src/interfaces/GroupUser'
import { Validator, matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineAction, defineState, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'
import { ChatService } from './ChatService'

//State

const GroupState = defineState({
  name: 'GroupState',
  initial: () => ({
    groups: {
      groups: [] as Array<Group>,
      total: 0,
      limit: 5,
      skip: 0
    },
    invitableGroups: {
      groups: [] as Array<Group>,
      total: 0,
      limit: 5,
      skip: 0
    },
    getInvitableGroupsInProgress: false,
    getGroupsInProgress: false,
    invitableUpdateNeeded: true,
    updateNeeded: true,
    closeDetails: ''
  })
})

export const GroupServiceReceptor = (action) => {
  const s = getMutableState(GroupState)
  matches(action)
    .when(GroupAction.loadedGroups.matches, (action) => {
      if (s.updateNeeded.value) {
        s.groups.groups.set(action.groups)
      } else {
        s.groups.groups.set([...s.groups.groups.value, ...action.groups])
      }
      s.groups.merge({ skip: action.skip, limit: action.limit, total: action.total })
      s.updateNeeded.set(false)
      return s.getGroupsInProgress.set(false)
    })
    .when(GroupAction.loadedInvitableGroups.matches, (action) => {
      if (s.updateNeeded.value) {
        s.invitableGroups.groups.set(action.groups)
      } else {
        s.invitableGroups.groups.set([...s.invitableGroups.groups.value, ...action.groups])
      }
      s.invitableGroups.skip.set(action.skip)
      s.invitableGroups.limit.set(action.limit)
      s.invitableGroups.total.set(action.total)
      return s.merge({ invitableUpdateNeeded: false, getInvitableGroupsInProgress: false })
    })
    .when(GroupAction.createdGroup.matches, () => {
      return s.merge({ updateNeeded: true, invitableUpdateNeeded: true })
    })
    .when(GroupAction.patchedGroup.matches, (action) => {
      const groupIndex = s.groups.groups.get({ noproxy: true }).findIndex((groupItem) => {
        return groupItem != null && groupItem.id === action.group.id
      })
      if (groupIndex !== -1) {
        return s.groups.groups[groupIndex].set(action.group)
      }
      return s
    })
    .when(GroupAction.removedGroup.matches, () => {
      s.updateNeeded.set(true)
      return s.invitableUpdateNeeded.set(true)
    })
    .when(GroupAction.invitedGroupUser.matches, () => {
      return s.updateNeeded.set(true)
    })
    .when(GroupAction.leftGroup.matches, () => {
      return s.updateNeeded.set(true)
    })
    .when(GroupAction.fetchingGroups.matches, () => {
      return s.getGroupsInProgress.set(true)
    })
    .when(GroupAction.fetchingInvitableGroups.matches, () => {
      return s.getInvitableGroupsInProgress.set(true)
    })
    .when(GroupAction.createdGroupUser.matches, (action) => {
      const groupIndex = s.groups.groups.get({ noproxy: true }).findIndex((groupItem) => {
        return groupItem != null && groupItem.id === action.groupUser.groupId
      })
      if (groupIndex !== -1) {
        const group = s.groups.groups[groupIndex]
        const groupUserIndex = group.groupUsers.value!.findIndex((groupUserItem) => {
          return groupUserItem != null && groupUserItem.id === action.groupUser.id
        })
        if (groupUserIndex !== -1) {
          group.groupUsers[groupUserIndex].set(action.groupUser)
        } else {
          group.groupUsers.merge([action.groupUser])
        }
      }

      return s.merge({ updateNeeded: true })
    })
    .when(GroupAction.patchedGroupUser.matches, (action) => {
      const groupIndex = s.groups.groups.get({ noproxy: true }).findIndex((groupItem) => {
        return groupItem != null && groupItem.id === action.groupUser.groupId
      })
      if (groupIndex !== -1) {
        const group = s.groups.groups[groupIndex]
        const groupUserIndex = group.groupUsers.value!.findIndex((groupUserItem) => {
          return groupUserItem != null && groupUserItem.id === action.groupUser.id
        })
        if (groupUserIndex !== -1) {
          group.groupUsers[groupUserIndex].set(action.groupUser)
        } else {
          group.groupUsers.merge([action.groupUser])
        }
      }
      return s
    })
    .when(GroupAction.removedGroupUser.matches, (action) => {
      const groupIndex = s.groups.groups.get({ noproxy: true }).findIndex((groupItem) => {
        return groupItem != null && groupItem.id === action.groupUser.groupId
      })
      if (groupIndex !== -1) {
        const group = s.groups.groups[groupIndex]
        const groupUserIndex = group.groupUsers.value!.findIndex((groupUserItem) => {
          return groupUserItem != null && groupUserItem.id === action.groupUser.id
        })
        if (groupUserIndex !== -1) {
          group.groupUsers.merge({
            [groupUserIndex]: none
          })
        }
      }
      return action.self === true
        ? s.merge({ closeDetails: action.groupUser.groupId, updateNeeded: true })
        : s.merge({ updateNeeded: true })
    })
    .when(GroupAction.removeCloseGroupDetail.matches, () => {
      return s.closeDetails.set('')
    })
}

//Service
export const GroupService = {
  getGroups: async (skip?: number, limit?: number) => {
    dispatchAction(GroupAction.fetchingGroups({}))
    const groupActionState = getState(GroupState)
    try {
      const groupResults = await Engine.instance.api.service('group').find({
        query: {
          $limit: limit != null ? limit : groupActionState.groups.limit,
          $skip: skip != null ? skip : groupActionState.groups.skip
        }
      })
      dispatchAction(
        GroupAction.loadedGroups({
          groups: groupResults.data,
          total: groupResults.total,
          limit: groupResults.limit,
          skip: groupResults.skip
        })
      )
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createGroup: async (values: CreateGroup) => {
    try {
      const result = (await Engine.instance.api.service('group').create({
        name: values.name,
        description: values.description
      })) as Group
      dispatchAction(GroupAction.createdGroup({ group: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchGroup: async (values: Group) => {
    const patch = {}
    if (values.name != null) {
      ;(patch as any).name = values.name
    }
    if (values.description != null) {
      ;(patch as any).description = values.description
    }
    try {
      const data = (await Engine.instance.api.service('group').patch(values.id ?? '', patch)) as Group
      // ;(patch as any).id = values.id
      dispatchAction(GroupAction.patchedGroup({ group: data }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeGroup: async (groupId: string) => {
    try {
      const channelResult = (await Engine.instance.api.service('channel').find({
        query: {
          channelType: 'group',
          groupId: groupId
        }
      })) as any
      if (channelResult.total > 0) {
        await Engine.instance.api.service('channel').remove(channelResult.data[0].id)
      }
      await Engine.instance.api.service('group').remove(groupId)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeGroupUser: async (groupUserId: string) => {
    try {
      await Engine.instance.api.service('group-user').remove(groupUserId)
      dispatchAction(GroupAction.leftGroup({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getInvitableGroups: async (skip?: number, limit?: number) => {
    dispatchAction(GroupAction.fetchingInvitableGroups({}))
    const groupActionState = getState(GroupState)
    try {
      const groupResults = await Engine.instance.api.service('group').find({
        query: {
          invitable: true,
          $limit: limit != null ? limit : groupActionState.groups.limit,
          $skip: skip != null ? skip : groupActionState.groups.skip
        }
      })
      dispatchAction(
        GroupAction.loadedInvitableGroups({
          groups: groupResults.data,
          skip: groupResults.skip,
          limit: groupResults.limit,
          total: groupResults.total
        })
      )
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
      dispatchAction(GroupAction.loadedInvitableGroups({ groups: [], limit: 0, skip: 0, total: 0 }))
    }
  },
  useAPIListeners: () => {
    useEffect(() => {
      const groupUserCreatedListener = (params) => {
        const newGroupUser = params.groupUser
        dispatchAction(GroupAction.createdGroupUser({ groupUser: newGroupUser }))
      }

      const groupUserPatchedListener = (params) => {
        const updatedGroupUser = params.groupUser
        dispatchAction(GroupAction.patchedGroupUser({ groupUser: updatedGroupUser }))
      }

      const groupUserRemovedListener = (params) => {
        const deletedGroupUser = params.groupUser
        const selfUser = getState(AuthState).user
        dispatchAction(GroupAction.removedGroupUser({ groupUser: deletedGroupUser, self: params.self }))
        if (deletedGroupUser.userId === selfUser.id)
          ChatService.clearChatTargetIfCurrent('group', { id: params.groupUser.groupId })
      }

      const groupCreatedListener = (params) => {
        dispatchAction(GroupAction.createdGroup({ group: params.group }))
      }

      const groupPatchedListener = (params) => {
        dispatchAction(GroupAction.patchedGroup({ group: params.group }))
      }

      const groupRemovedListener = (params) => {
        dispatchAction(GroupAction.removedGroup({ group: params.group }))
        ChatService.clearChatTargetIfCurrent('group', params.group)
      }

      const groupRefreshListener = (params) => {
        dispatchAction(GroupAction.createdGroup({ group: params.group }))
      }

      Engine.instance.api.service('group-user').on('created', groupUserCreatedListener)
      Engine.instance.api.service('group-user').on('patched', groupUserPatchedListener)
      Engine.instance.api.service('group-user').on('removed', groupUserRemovedListener)
      Engine.instance.api.service('group').on('created', groupCreatedListener)
      Engine.instance.api.service('group').on('patched', groupPatchedListener)
      Engine.instance.api.service('group').on('removed', groupRemovedListener)
      Engine.instance.api.service('group').on('refresh', groupRefreshListener)

      return () => {
        Engine.instance.api.service('group-user').off('created', groupUserCreatedListener)
        Engine.instance.api.service('group-user').off('patched', groupUserPatchedListener)
        Engine.instance.api.service('group-user').off('removed', groupUserRemovedListener)
        Engine.instance.api.service('group').off('created', groupCreatedListener)
        Engine.instance.api.service('group').off('patched', groupPatchedListener)
        Engine.instance.api.service('group').off('removed', groupRemovedListener)
        Engine.instance.api.service('group').off('refresh', groupRefreshListener)
      }
    }, [])
  }
}

//Action
export class GroupAction {
  static loadedGroups = defineAction({
    type: 'ee.client.Group.LOADED_GROUPS' as const,
    groups: matches.array as Validator<unknown, Group[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static createdGroup = defineAction({
    type: 'ee.client.Group.CREATED_GROUP' as const,
    group: matches.object as Validator<unknown, Group>
  })

  static patchedGroup = defineAction({
    type: 'ee.client.Group.PATCHED_GROUP' as const,
    group: matches.object as Validator<unknown, Group>
  })

  static removedGroup = defineAction({
    type: 'ee.client.Group.REMOVED_GROUP' as const,
    group: matches.object as Validator<unknown, Group>
  })

  static createdGroupUser = defineAction({
    type: 'ee.client.Group.CREATED_GROUP_USER' as const,
    groupUser: matches.object as Validator<unknown, GroupUser>
  })

  static patchedGroupUser = defineAction({
    type: 'ee.client.Group.PATCHED_GROUP_USER' as const,
    groupUser: matches.object as Validator<unknown, GroupUser>
  })

  static removedGroupUser = defineAction({
    type: 'ee.client.Group.REMOVED_GROUP_USER' as const,
    groupUser: matches.object as Validator<unknown, GroupUser>,
    self: matches.boolean
  })

  static invitedGroupUser = defineAction({
    type: 'ee.client.Group.INVITED_GROUP_USER' as const
  })

  static leftGroup = defineAction({
    type: 'ee.client.Group.LEFT_GROUP' as const
  })

  static fetchingGroups = defineAction({
    type: 'ee.client.Group.FETCHING_GROUPS' as const
  })

  static loadedInvitableGroups = defineAction({
    type: 'ee.client.Group.LOADED_INVITABLE_GROUPS' as const,
    groups: matches.array as Validator<unknown, Group[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static fetchingInvitableGroups = defineAction({
    type: 'ee.client.Group.FETCHING_INVITABLE_GROUPS' as const
  })

  static removeCloseGroupDetail = defineAction({
    type: 'ee.client.Group.REMOVE_CLOSE_GROUP_DETAIL' as const
  })
}
