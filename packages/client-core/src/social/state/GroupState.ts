import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import _ from 'lodash'
import { GroupUser } from '@xrengine/common/src/interfaces/GroupUser'
import { GroupActionType } from './GroupActions'
import { Group } from '@xrengine/common/src/interfaces/Group'
import { store } from '../../store'

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
    groupIndex
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
          return groupItem != null && groupItem.id === groupUser.groupId
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
        updateMap = s.groups.value
        updateMapGroups = updateMap.groups
        updateMapGroupsChild = _.find(updateMapGroups, (group) => {
          return group != null && group.id === groupUser.groupId
        })
        if (updateMapGroupsChild != null) {
          updateMapGroupUsers = updateMapGroupsChild.groupUsers
          const match = updateMapGroupUsers.find((gUser) => {
            return gUser != null && gUser.id === groupUser.id
          })
          updateMapGroupUsers = Array.isArray(updateMapGroupUsers)
            ? match == null
              ? updateMapGroupUsers.concat([groupUser])
              : updateMapGroupUsers.map((gUser) => (gUser.id === groupUser.id ? groupUser : gUser))
            : [groupUser]
          updateMapGroupsChild.groupUsers = updateMapGroupUsers
        }
        return s.groups.groups.set(updateMapGroups)

      case 'PATCHED_GROUP_USER':
        newValues = action
        groupUser = newValues.groupUser
        updateMap = s.groups.value
        updateMapGroups = updateMap.groups
        updateMapGroupsChild = _.find(updateMapGroups, (group) => {
          return group != null && group.id === groupUser.groupId
        })
        if (updateMapGroupsChild != null) {
          updateMapGroupsChild.groupUsers = updateMapGroupsChild.groupUsers.map((gUser) =>
            gUser.id === groupUser.id ? groupUser : gUser
          )
        }
        s.groups.groups.set(updateMapGroups)

      case 'REMOVED_GROUP_USER':
        newValues = action
        groupUser = newValues.groupUser
        const self = newValues.self
        updateMap = s.groups.value
        updateMapGroups = updateMap.groups
        updateMapGroupsChild = _.find(updateMapGroups, (group) => {
          return group != null && group.id === groupUser.groupId
        })
        if (updateMapGroupsChild != null) {
          updateMapGroupUsers = updateMapGroupsChild.groupUsers
          _.findIndex(updateMapGroupUsers, (gUser: GroupUser) => groupUser.id === gUser.id)
        }

        let returned = s.groups.groups.set(updateMapGroups)
        if (self === true) {
          returned = s.merge({ closeDetails: groupUser.groupId, updateNeeded: true })
        }
        return returned

      case 'REMOVE_CLOSE_GROUP_DETAIL':
        return s.closeDetails.set('')
    }
  }, action.type)
})

export const accessGroupState = () => state

export const useGroupState = () => useState(state) as any as typeof state
