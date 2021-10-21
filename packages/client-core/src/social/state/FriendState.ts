import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { FriendActionType } from './FriendActions'
import { User } from '@xrengine/common/src/interfaces/User'
import _ from 'lodash'

const state = createState({
  friends: {
    friends: [] as Array<User>,
    total: 0,
    limit: 5,
    skip: 0
  },
  getFriendsInProgress: false,
  updateNeeded: true
})

export const receptor = (action: FriendActionType): any => {
  let newValues, selfUser, otherUser, otherUserId
  state.batch((s) => {
    switch (action.type) {
      case 'LOADED_FRIENDS':
        newValues = action
        if (s.updateNeeded.value === true) {
          s.friends.friends.set(newValues.friends)
        } else {
          s.friends.friends.set([s.friends.friends.value, newValues.friends])
        }
        s.friends.skip.set(newValues.skip)
        s.friends.limit.set(newValues.limit)
        s.friends.total.set(newValues.total)
        s.updateNeeded.set(false)
        return s.getFriendsInProgress.set(false)

      case 'CREATED_FRIEND':
        newValues = action
        const createdUserRelationship = newValues.userRelationship
        s.friends.friends.set([...s.friends.friends.value, createdUserRelationship])
      case 'PATCHED_FRIEND':
        newValues = action
        const patchedUserRelationship = newValues.userRelationship
        selfUser = newValues.selfUser
        otherUser =
          patchedUserRelationship.userId === selfUser.id
            ? patchedUserRelationship.relatedUser
            : patchedUserRelationship.user

        const patchedFriendIndex = s.friends.friends.value.findIndex((friendItem) => {
          return friendItem != null && friendItem.id === otherUser.id
        })
        if (patchedFriendIndex === -1) {
          return s.friends.friends.set([...s.friends.friends.value, otherUser])
        } else {
          return s.friends.friends[patchedFriendIndex].set(otherUser)
        }

      case 'REMOVED_FRIEND':
        newValues = action
        const removedUserRelationship = newValues.userRelationship
        selfUser = newValues.selfUser
        otherUserId =
          removedUserRelationship.userId === selfUser.id
            ? removedUserRelationship.relatedUserId
            : removedUserRelationship.userId

        const friendId = s.friends.friends.value.findIndex((friendItem) => {
          return friendItem != null && friendItem.id === otherUserId
        })

        return s.friends.friends[friendId].set(none)
      case 'FETCHING_FRIENDS':
        return s.getFriendsInProgress.set(true)
    }
  }, action.type)
}

export const accessFriendState = () => state

export const useFriendState = () => useState(state) as any as typeof state
