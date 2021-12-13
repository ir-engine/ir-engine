import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { Config } from '@xrengine/common/src/config'
import { UserAction } from '../../user/services/UserService'
import { accessAuthState } from '../../user/services/AuthService'
import { User } from '@xrengine/common/src/interfaces/User'
import { UserRelationship } from '@xrengine/common/src/interfaces/UserRelationship'
import { FriendResult } from '@xrengine/common/src/interfaces/FriendResult'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import _ from 'lodash'

//State
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

store.receptors.push((action: FriendActionType): any => {
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
        return s.friends.friends.set([...s.friends.friends.value, createdUserRelationship])
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
})

export const accessFriendState = () => state

export const useFriendState = () => useState(state) as any as typeof state

//Service
export const FriendService = {
  // export function getUserRelationshipasync (userId: string) {
  // const dispatch = useDispatch(); {
  //     // dispatch(actionProcessing(true))
  //
  //     console.log('------get relations-------', userId)
  //     client.service('user-relationship').find({
  //       query: {
  //         userId
  //       }
  //     }).then((res: any) => {
  //       console.log('relations------', res)
  //       dispatch(loadedUserRelationship(res as Relationship))
  //     })
  //       .catch((err: any) => {
  //         console.log(err)
  //       })
  //       // .finally(() => dispatch(actionProcessing(false)))
  //   }
  // }

  getFriends: async (skip?: number, limit?: number) => {
    const dispatch = useDispatch()
    {
      dispatch(FriendAction.fetchingFriends())
      try {
        const friendState = accessFriendState()
        const friendResult = await client.service('user').find({
          query: {
            action: 'friends',
            $limit: limit != null ? limit : friendState.friends.limit.value,
            $skip: skip != null ? skip : friendState.friends.skip.value
          }
        })
        dispatch(FriendAction.loadedFriends(friendResult))
      } catch (err) {
        AlertService.dispatchAlertError(err)
        dispatch(FriendAction.loadedFriends({ data: [], limit: 0, skip: 0, total: 0 }))
      }
    }
  },

  // function createRelationasync (userId: string, relatedUserId: string, type: 'friend' | 'blocking') {
  // const dispatch = useDispatch(); {
  //     client.service('user-relationship').create({
  //       relatedUserId,
  //       userRelationshipType: type
  //     }).then((res: any) => {
  //       console.log('add relations------', res)
  //       dispatch(changedRelation())
  //     })
  //       .catch((err: any) => {
  //         console.log(err)
  //       })
  //       // .finally(() => dispatch(actionProcessing(false)))
  //   }
  // }
  //
  removeFriend: async (relatedUserId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('user-relationship').remove(relatedUserId)
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  //
  // function patchRelationasync (userId: string, relatedUserId: string, type: 'friend') {
  // const dispatch = useDispatch(); {
  //     client.service('user-relationship').patch(relatedUserId, {
  //       userRelationshipType: type
  //     }).then((res: any) => {
  //       console.log('Patching relationship to friend', res)
  //       dispatch(changedRelation())
  //     })
  //       .catch((err: any) => {
  //         console.log(err)
  //       })
  //       // .finally(() => dispatch(actionProcessing(false)))
  //   }
  // }

  // export function requestFriend(userId: string, relatedUserId: string) {
  //   return createRelation(userId, relatedUserId, 'friend')
  // }
  //
  // export function blockUser(userId: string, relatedUserId: string) {
  //   return createRelation(userId, relatedUserId, 'blocking')
  // }
  //
  // export function acceptFriend(userId: string, relatedUserId: string) {
  //   return patchRelation(userId, relatedUserId, 'friend')
  // }
  //
  // export function declineFriend(userId: string, relatedUserId: string) {
  //   return removeRelation(userId, relatedUserId)
  // }
  //
  // export function cancelBlock(userId: string, relatedUserId: string) {
  //   return removeRelation(userId, relatedUserId)
  // }

  unfriend: (relatedUserId: string) => {
    return FriendService.removeFriend(relatedUserId)
  }
}
if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('user-relationship').on('created', (params) => {
    if (params.userRelationship.userRelationshipType === 'friend') {
      store.dispatch(FriendAction.createdFriend(params.userRelationship))
    }
  })

  client.service('user-relationship').on('patched', (params) => {
    const patchedUserRelationship = params.userRelationship
    const selfUser = accessAuthState().user
    if (patchedUserRelationship.userRelationshipType === 'friend') {
      store.dispatch(FriendAction.patchedFriend(patchedUserRelationship, selfUser.value))
      if (
        patchedUserRelationship.user.channelInstanceId != null &&
        patchedUserRelationship.user.channelInstanceId === selfUser.channelInstanceId.value
      )
        store.dispatch(UserAction.addedChannelLayerUser(patchedUserRelationship.user))
      if (patchedUserRelationship.user.channelInstanceId !== selfUser.channelInstanceId.value)
        store.dispatch(UserAction.removedChannelLayerUser(patchedUserRelationship.user))
    }
  })

  client.service('user-relationship').on('removed', (params) => {
    const deletedUserRelationship = params.userRelationship
    const selfUser = accessAuthState().user
    if (deletedUserRelationship.userRelationshipType === 'friend') {
      store.dispatch(FriendAction.removedFriend(deletedUserRelationship, selfUser.value))
      if (
        deletedUserRelationship.user.channelInstanceId != null &&
        deletedUserRelationship.user.channelInstanceId === selfUser.channelInstanceId.value
      )
        store.dispatch(UserAction.addedChannelLayerUser(deletedUserRelationship.user))
      if (deletedUserRelationship.user.channelInstanceId !== selfUser.channelInstanceId.value)
        store.dispatch(UserAction.removedChannelLayerUser(deletedUserRelationship.user))
    }
  })
}

//Action
export const FriendAction = {
  loadedFriends: (friendResult: FriendResult) => {
    return {
      type: 'LOADED_FRIENDS' as const,
      friends: friendResult.data,
      total: friendResult.total,
      limit: friendResult.limit,
      skip: friendResult.skip
    }
  },
  createdFriend: (userRelationship: UserRelationship) => {
    return {
      type: 'CREATED_FRIEND' as const,
      userRelationship: userRelationship
    }
  },
  patchedFriend: (userRelationship: UserRelationship, selfUser: User) => {
    return {
      type: 'PATCHED_FRIEND' as const,
      userRelationship: userRelationship,
      selfUser: selfUser
    }
  },
  removedFriend: (userRelationship: UserRelationship, selfUser: User) => {
    return {
      type: 'REMOVED_FRIEND' as const,
      userRelationship: userRelationship,
      selfUser: selfUser
    }
  },
  fetchingFriends: () => {
    return {
      type: 'FETCHING_FRIENDS' as const
    }
  }
}

export type FriendActionType = ReturnType<typeof FriendAction[keyof typeof FriendAction]>
