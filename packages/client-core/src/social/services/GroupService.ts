import { createState, none, useState } from '@hookstate/core'
import _ from 'lodash'

import { Group } from '@xrengine/common/src/interfaces/Group'
import { GroupResult } from '@xrengine/common/src/interfaces/GroupResult'
import { GroupUser } from '@xrengine/common/src/interfaces/GroupUser'

import { AlertService } from '../../common/services/AlertService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { accessAuthState } from '../../user/services/AuthService'
import { UserAction } from '../../user/services/UserService'
import waitForClientAuthenticated from '../../util/wait-for-client-authenticated'
import { ChatService } from './ChatService'

//State

const state = createState({
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

store.receptors.push((action: GroupActionType): any => {
  let newValues,
    updateMap,
    updateMapGroups,
    updateMapGroupsChild,
    updateMapGroupUsers,
    groupUser,
    updateGroup,
    groupIndex,
    groupUserIndex
  state.batch((s) => {
    switch (action.type) {
      case 'LOADED_GROUPS':
        newValues = action
        if (s.updateNeeded.value === true) {
          s.groups.groups.set(newValues.groups)
        } else {
          s.groups.groups.set([...s.groups.groups.value, ...newValues.groups])
        }
        s.groups.merge({ skip: newValues.skip, limit: newValues.limit, total: newValues.total })
        s.updateNeeded.set(false)
        return s.getGroupsInProgress.set(false)

      case 'LOADED_INVITABLE_GROUPS':
        newValues = action

        if (s.updateNeeded.value === true) {
          s.invitableGroups.groups.set(newValues.groups)
        } else {
          s.invitableGroups.groups.set([...s.invitableGroups.groups.value, ...newValues.groups])
        }
        s.invitableGroups.skip.set(newValues.skip)
        s.invitableGroups.limit.set(newValues.limit)
        s.invitableGroups.total.set(newValues.total)
        return s.merge({ invitableUpdateNeeded: false, getInvitableGroupsInProgress: false })

      case 'CREATED_GROUP':
        newValues = action
        return s.merge({ updateNeeded: true, invitableUpdateNeeded: true })
      case 'PATCHED_GROUP':
        newValues = action
        updateGroup = newValues.group

        groupIndex = s.groups.groups.value.findIndex((groupItem) => {
          // return groupItem != null && groupItem.id === groupUser.groupId
          return groupItem != null && groupItem.id === updateGroup.id
        })
        if (groupIndex !== -1) {
          return s.groups.groups[groupIndex].set(updateGroup)
        }
        return s
      case 'REMOVED_GROUP':
        s.updateNeeded.set(true)
        return s.invitableUpdateNeeded.set(true)
      case 'INVITED_GROUP_USER':
        return s
      // .set('updateNeeded', true)
      case 'LEFT_GROUP':
        return s.updateNeeded.set(true)
      case 'FETCHING_GROUPS':
        return s.getGroupsInProgress.set(true)
      case 'FETCHING_INVITABLE_GROUPS':
        return s.getInvitableGroupsInProgress.set(true)
      case 'CREATED_GROUP_USER':
        newValues = action
        groupUser = newValues.groupUser
        groupIndex = s.groups.groups.value.findIndex((groupItem) => {
          return groupItem != null && groupItem.id === groupUser.groupId
        })
        if (groupIndex !== -1) {
          const group = s.groups.groups[groupIndex]
          groupUserIndex = group.groupUsers.value.findIndex((groupUserItem) => {
            return groupUserItem != null && groupUserItem.id === groupUser.id
          })
          if (groupUserIndex !== -1) {
            group.groupUsers[groupUserIndex].set(groupUser)
          } else {
            group.groupUsers.merge(groupUser)
          }
        }

        return s.merge({ updateNeeded: true })
      case 'PATCHED_GROUP_USER':
        newValues = action
        groupUser = newValues.groupUser
        groupIndex = s.groups.groups.value.findIndex((groupItem) => {
          return groupItem != null && groupItem.id === groupUser.groupId
        })
        if (groupIndex !== -1) {
          const group = s.groups.groups[groupIndex]
          groupUserIndex = group.groupUsers.value.findIndex((groupUserItem) => {
            return groupUserItem != null && groupUserItem.id === groupUser.id
          })
          if (groupUserIndex !== -1) {
            group.groupUsers[groupUserIndex].set(groupUser)
          } else {
            group.groupUsers.merge(groupUser)
          }
        }
        // updateMap = s.groups.value
        // updateMapGroups = updateMap.groups
        // updateMapGroupsChild = _.find(updateMapGroups, (group) => {
        //   return group != null && group.id === groupUser.groupId
        // })
        // if (updateMapGroupsChild != null) {
        //   updateMapGroupsChild.groupUsers = updateMapGroupsChild.groupUsers.map((gUser) =>
        //     gUser.id === groupUser.id ? groupUser : gUser
        //   )
        // }
        // s.groups.groups.set(updateMapGroups)
        return s

      case 'REMOVED_GROUP_USER':
        newValues = action
        groupUser = newValues.groupUser
        const self = newValues.self
        groupIndex = s.groups.groups.value.findIndex((groupItem) => {
          return groupItem != null && groupItem.id === groupUser.groupId
        })
        if (groupIndex !== -1) {
          const group = s.groups.groups[groupIndex]
          groupUserIndex = group.groupUsers.value.findIndex((groupUserItem) => {
            return groupUserItem != null && groupUserItem.id === groupUser.id
          })
          if (groupUserIndex !== -1) {
            group.groupUsers.merge({
              [groupUserIndex]: none
            })
          }
        }
        return self === true
          ? s.merge({ closeDetails: groupUser.groupId, updateNeeded: true })
          : s.merge({ updateNeeded: true })

      case 'REMOVE_CLOSE_GROUP_DETAIL':
        return s.closeDetails.set('')
    }
  }, action.type)
})

export const accessGroupState = () => state

export const useGroupState = () => useState(state) as any as typeof state

//Service
export const GroupService = {
  getGroups: async (skip?: number, limit?: number) => {
    const dispatch = useDispatch()
    {
      dispatch(GroupAction.fetchingGroups())
      const groupActionState = accessGroupState().value
      try {
        const groupResults = await client.service('group').find({
          query: {
            $limit: limit != null ? limit : groupActionState.groups.limit,
            $skip: skip != null ? skip : groupActionState.groups.skip
          }
        })
        dispatch(GroupAction.loadedGroups(groupResults))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  createGroup: async (values: any) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('group').create({
          name: values.name,
          description: values.description
        })
        dispatch(GroupAction.createdGroup(result))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  patchGroup: async (values: any) => {
    const dispatch = useDispatch()
    {
      const patch = {}
      if (values.name != null) {
        ;(patch as any).name = values.name
      }
      if (values.description != null) {
        ;(patch as any).description = values.description
      }
      try {
        const data = await client.service('group').patch(values.id, patch)
        // ;(patch as any).id = values.id
        dispatch(GroupAction.patchedGroup(data))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  removeGroup: async (groupId: string) => {
    const dispatch = useDispatch()
    {
      try {
        const channelResult = (await client.service('channel').find({
          query: {
            channelType: 'group',
            groupId: groupId
          }
        })) as any
        if (channelResult.total > 0) {
          await client.service('channel').remove(channelResult.data[0].id)
        }
        await client.service('group').remove(groupId)
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  removeGroupUser: async (groupUserId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('group-user').remove(groupUserId)
        dispatch(GroupAction.leftGroup())
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  getInvitableGroups: async (skip?: number, limit?: number) => {
    const dispatch = useDispatch()
    {
      dispatch(GroupAction.fetchingInvitableGroups())
      const groupActionState = accessGroupState().value
      try {
        const groupResults = await client.service('group').find({
          query: {
            invitable: true,
            $limit: limit != null ? limit : groupActionState.groups.limit,
            $skip: skip != null ? skip : groupActionState.groups.skip
          }
        })
        dispatch(GroupAction.loadedInvitableGroups(groupResults))
      } catch (err) {
        AlertService.dispatchAlertError(err)
        dispatch(GroupAction.loadedInvitableGroups({ data: [], limit: 0, skip: 0, total: 0 }))
      }
    }
  }
}
if (globalThis.process.env['VITE_OFFLINE_MODE'] !== 'true') {
  client.service('group-user').on('created', (params) => {
    const newGroupUser = params.groupUser
    const selfUser = accessAuthState().user
    store.dispatch(GroupAction.createdGroupUser(newGroupUser))
    if (
      newGroupUser.user.channelInstanceId != null &&
      newGroupUser.user.channelInstanceId === selfUser.channelInstanceId.value
    )
      store.dispatch(UserAction.addedChannelLayerUser(newGroupUser.user))
    if (newGroupUser.user.channelInstanceId !== selfUser.channelInstanceId.value)
      store.dispatch(UserAction.removedChannelLayerUser(newGroupUser.user))
  })

  client.service('group-user').on('patched', (params) => {
    const updatedGroupUser = params.groupUser
    const selfUser = accessAuthState().user
    store.dispatch(GroupAction.patchedGroupUser(updatedGroupUser))
    if (
      updatedGroupUser.user.channelInstanceId != null &&
      updatedGroupUser.user.channelInstanceId === selfUser.channelInstanceId.value
    )
      store.dispatch(UserAction.addedChannelLayerUser(updatedGroupUser.user))
    if (updatedGroupUser.user.channelInstanceId !== selfUser.channelInstanceId.value)
      store.dispatch(UserAction.removedChannelLayerUser(updatedGroupUser.user))
  })

  client.service('group-user').on('removed', (params) => {
    const deletedGroupUser = params.groupUser
    const selfUser = accessAuthState().user
    store.dispatch(GroupAction.removedGroupUser(deletedGroupUser, params.self))
    store.dispatch(UserAction.removedChannelLayerUser(deletedGroupUser.user))
    if (deletedGroupUser.userId === selfUser.id.value)
      ChatService.clearChatTargetIfCurrent('group', { id: params.groupUser.groupId })
  })

  client.service('group').on('created', (params) => {
    store.dispatch(GroupAction.createdGroup(params.group))
  })

  client.service('group').on('patched', (params) => {
    store.dispatch(GroupAction.patchedGroup(params.group))
  })

  client.service('group').on('removed', (params) => {
    store.dispatch(GroupAction.removedGroup(params.group))
    ChatService.clearChatTargetIfCurrent('group', params.group)
  })

  client.service('group').on('refresh', (params) => {
    store.dispatch(GroupAction.createdGroup(params.group))
  })
}

//Action
export const GroupAction = {
  loadedGroups: (groupResult: GroupResult) => {
    return {
      type: 'LOADED_GROUPS' as const,
      groups: groupResult.data,
      total: groupResult.total,
      limit: groupResult.limit,
      skip: groupResult.skip
    }
  },
  createdGroup: (group: Group) => {
    return {
      type: 'CREATED_GROUP' as const,
      group: group
    }
  },
  patchedGroup: (group: Group) => {
    return {
      type: 'PATCHED_GROUP' as const,
      group: group
    }
  },
  removedGroup: (group: Group) => {
    return {
      type: 'REMOVED_GROUP' as const,
      group: group
    }
  },
  createdGroupUser: (groupUser: GroupUser) => {
    return {
      type: 'CREATED_GROUP_USER' as const,
      groupUser: groupUser
    }
  },
  patchedGroupUser: (groupUser: GroupUser) => {
    return {
      type: 'PATCHED_GROUP_USER' as const,
      groupUser: groupUser
    }
  },
  removedGroupUser: (groupUser: GroupUser, self: boolean) => {
    return {
      type: 'REMOVED_GROUP_USER' as const,
      groupUser: groupUser,
      self: self
    }
  },
  invitedGroupUser: () => {
    return {
      type: 'INVITED_GROUP_USER' as const
    }
  },
  leftGroup: () => {
    return {
      type: 'LEFT_GROUP' as const
    }
  },
  fetchingGroups: () => {
    return {
      type: 'FETCHING_GROUPS' as const
    }
  },
  loadedInvitableGroups: (groupResult: GroupResult) => {
    return {
      type: 'LOADED_INVITABLE_GROUPS' as const,
      groups: groupResult.data,
      total: groupResult.total,
      limit: groupResult.limit,
      skip: groupResult.skip
    }
  },
  fetchingInvitableGroups: () => {
    return {
      type: 'FETCHING_INVITABLE_GROUPS' as const
    }
  },
  removeCloseGroupDetail: () => {
    return {
      type: 'REMOVE_CLOSE_GROUP_DETAIL' as const
    }
  }
}

export type GroupActionType = ReturnType<typeof GroupAction[keyof typeof GroupAction]>
