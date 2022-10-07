import { none } from '@hookstate/core'
import { useEffect } from 'react'

import { CreateGroup, Group } from '@xrengine/common/src/interfaces/Group'
import { GroupUser } from '@xrengine/common/src/interfaces/GroupUser'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'
import { NetworkUserAction } from '../../user/services/NetworkUserService'
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
  const s = getState(GroupState)
  matches(action)
    .when(GroupAction.loadedGroups.matches, (action) => {
      if (s.updateNeeded.value === true) {
        s.groups.groups.set(action.groups)
      } else {
        s.groups.groups.set([...s.groups.groups.value, ...action.groups])
      }
      s.groups.merge({ skip: action.skip, limit: action.limit, total: action.total })
      s.updateNeeded.set(false)
      return s.getGroupsInProgress.set(false)
    })
    .when(GroupAction.loadedInvitableGroups.matches, (action) => {
      if (s.updateNeeded.value === true) {
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
      const groupIndex = s.groups.groups.value.findIndex((groupItem) => {
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
      const groupIndex = s.groups.groups.value.findIndex((groupItem) => {
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
          group.groupUsers.merge(action.groupUser)
        }
      }

      return s.merge({ updateNeeded: true })
    })
    .when(GroupAction.patchedGroupUser.matches, (action) => {
      const groupIndex = s.groups.groups.value.findIndex((groupItem) => {
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
          group.groupUsers.merge(action.groupUser)
        }
      }
      return s
    })
    .when(GroupAction.removedGroupUser.matches, (action) => {
      const groupIndex = s.groups.groups.value.findIndex((groupItem) => {
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

export const accessGroupState = () => getState(GroupState)

export const useGroupState = () => useState(accessGroupState())

//Service
export const GroupService = {
  getGroups: async (skip?: number, limit?: number) => {
    dispatchAction(GroupAction.fetchingGroups({}))
    const groupActionState = accessGroupState().value
    try {
      const groupResults = await API.instance.client.service('group').find({
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
      const result = (await API.instance.client.service('group').create({
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
      const data = (await API.instance.client.service('group').patch(values.id ?? '', patch)) as Group
      // ;(patch as any).id = values.id
      dispatchAction(GroupAction.patchedGroup({ group: data }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeGroup: async (groupId: string) => {
    try {
      const channelResult = (await API.instance.client.service('channel').find({
        query: {
          channelType: 'group',
          groupId: groupId
        }
      })) as any
      if (channelResult.total > 0) {
        await API.instance.client.service('channel').remove(channelResult.data[0].id)
      }
      await API.instance.client.service('group').remove(groupId)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeGroupUser: async (groupUserId: string) => {
    try {
      await API.instance.client.service('group-user').remove(groupUserId)
      dispatchAction(GroupAction.leftGroup({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getInvitableGroups: async (skip?: number, limit?: number) => {
    dispatchAction(GroupAction.fetchingInvitableGroups({}))
    const groupActionState = accessGroupState().value
    try {
      const groupResults = await API.instance.client.service('group').find({
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
        const selfUser = accessAuthState().user
        dispatchAction(GroupAction.createdGroupUser({ groupUser: newGroupUser }))
        if (
          newGroupUser.user.channelInstanceId != null &&
          newGroupUser.user.channelInstanceId === selfUser.channelInstanceId.value
        )
          dispatchAction(NetworkUserAction.addedChannelLayerUserAction({ user: newGroupUser.user }))
        if (newGroupUser.user.channelInstanceId !== selfUser.channelInstanceId.value)
          dispatchAction(NetworkUserAction.removedChannelLayerUserAction({ user: newGroupUser.user }))
      }

      const groupUserPatchedListener = (params) => {
        const updatedGroupUser = params.groupUser
        const selfUser = accessAuthState().user
        dispatchAction(GroupAction.patchedGroupUser({ groupUser: updatedGroupUser }))
        if (
          updatedGroupUser.user.channelInstanceId != null &&
          updatedGroupUser.user.channelInstanceId === selfUser.channelInstanceId.value
        )
          dispatchAction(NetworkUserAction.addedChannelLayerUserAction({ user: updatedGroupUser.user }))
        if (updatedGroupUser.user.channelInstanceId !== selfUser.channelInstanceId.value)
          dispatchAction(
            NetworkUserAction.removedChannelLayerUserAction({
              user: updatedGroupUser.user
            })
          )
      }

      const groupUserRemovedListener = (params) => {
        const deletedGroupUser = params.groupUser
        const selfUser = accessAuthState().user
        dispatchAction(GroupAction.removedGroupUser({ groupUser: deletedGroupUser, self: params.self }))
        dispatchAction(NetworkUserAction.removedChannelLayerUserAction({ user: deletedGroupUser.user }))
        if (deletedGroupUser.userId === selfUser.id.value)
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

      API.instance.client.service('group-user').on('created', groupUserCreatedListener)
      API.instance.client.service('group-user').on('patched', groupUserPatchedListener)
      API.instance.client.service('group-user').on('removed', groupUserRemovedListener)
      API.instance.client.service('group').on('created', groupCreatedListener)
      API.instance.client.service('group').on('patched', groupPatchedListener)
      API.instance.client.service('group').on('removed', groupRemovedListener)
      API.instance.client.service('group').on('refresh', groupRefreshListener)

      return () => {
        API.instance.client.service('group-user').off('created', groupUserCreatedListener)
        API.instance.client.service('group-user').off('patched', groupUserPatchedListener)
        API.instance.client.service('group-user').off('removed', groupUserRemovedListener)
        API.instance.client.service('group').off('created', groupCreatedListener)
        API.instance.client.service('group').off('patched', groupPatchedListener)
        API.instance.client.service('group').off('removed', groupRemovedListener)
        API.instance.client.service('group').off('refresh', groupRefreshListener)
      }
    }, [])
  }
}

//Action
export class GroupAction {
  static loadedGroups = defineAction({
    type: 'xre.client.Group.LOADED_GROUPS' as const,
    groups: matches.array as Validator<unknown, Group[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static createdGroup = defineAction({
    type: 'xre.client.Group.CREATED_GROUP' as const,
    group: matches.object as Validator<unknown, Group>
  })

  static patchedGroup = defineAction({
    type: 'xre.client.Group.PATCHED_GROUP' as const,
    group: matches.object as Validator<unknown, Group>
  })

  static removedGroup = defineAction({
    type: 'xre.client.Group.REMOVED_GROUP' as const,
    group: matches.object as Validator<unknown, Group>
  })

  static createdGroupUser = defineAction({
    type: 'xre.client.Group.CREATED_GROUP_USER' as const,
    groupUser: matches.object as Validator<unknown, GroupUser>
  })

  static patchedGroupUser = defineAction({
    type: 'xre.client.Group.PATCHED_GROUP_USER' as const,
    groupUser: matches.object as Validator<unknown, GroupUser>
  })

  static removedGroupUser = defineAction({
    type: 'xre.client.Group.REMOVED_GROUP_USER' as const,
    groupUser: matches.object as Validator<unknown, GroupUser>,
    self: matches.boolean
  })

  static invitedGroupUser = defineAction({
    type: 'xre.client.Group.INVITED_GROUP_USER' as const
  })

  static leftGroup = defineAction({
    type: 'xre.client.Group.LEFT_GROUP' as const
  })

  static fetchingGroups = defineAction({
    type: 'xre.client.Group.FETCHING_GROUPS' as const
  })

  static loadedInvitableGroups = defineAction({
    type: 'xre.client.Group.LOADED_INVITABLE_GROUPS' as const,
    groups: matches.array as Validator<unknown, Group[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })

  static fetchingInvitableGroups = defineAction({
    type: 'xre.client.Group.FETCHING_INVITABLE_GROUPS' as const
  })

  static removeCloseGroupDetail = defineAction({
    type: 'xre.client.Group.REMOVE_CLOSE_GROUP_DETAIL' as const
  })
}
