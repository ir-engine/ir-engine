import { Paginated } from '@feathersjs/feathers'
import { none } from '@hookstate/core'
import { useEffect } from 'react'

import { Relationship } from '@xrengine/common/src/interfaces/Relationship'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { UserRelationship } from '@xrengine/common/src/interfaces/UserRelationship'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'
import { UserAction } from '../../user/services/UserService'

const logger = multiLogger.child({ component: 'client-core:FriendService' })

//State
const FriendState = defineState({
  name: 'FriendState',
  initial: () => ({
    relationships: {
      blocked: [] as Array<UserInterface>,
      blocking: [] as Array<UserInterface>,
      friend: [] as Array<UserInterface>,
      requested: [] as Array<UserInterface>
    },
    isFetching: false,
    updateNeeded: true
  })
})

export const FriendServiceReceptor = (action) => {
  const s = getState(FriendState)
  matches(action)
    .when(FriendAction.fetchingFriendsAction.matches, () => {
      return s.isFetching.set(true)
    })
    .when(FriendAction.loadedFriendsAction.matches, (action) => {
      s.relationships.merge({
        blocked: action.relationships.blocked,
        blocking: action.relationships.blocking,
        friend: action.relationships.friend,
        requested: action.relationships.requested
      })
      s.updateNeeded.set(false)
      s.isFetching.set(false)
      return
    })
  // .when(FriendAction.createdFriendAction.matches, (action) => {
  //   let newValues
  //   newValues = action
  //   const createdUserRelationship = newValues.userRelationship
  //   return s.friends.friends.set([...s.friends.friends.value, createdUserRelationship])
  // })
  // .when(FriendAction.patchedFriendAction.matches, (action) => {
  //   let newValues, selfUser, otherUser
  //   newValues = action
  //   const patchedUserRelationship = newValues.userRelationship
  //   selfUser = newValues.selfUser
  //   otherUser =
  //     patchedUserRelationship.userId === selfUser.id
  //       ? patchedUserRelationship.relatedUser
  //       : patchedUserRelationship.user

  //   const patchedFriendIndex = s.friends.friends.value.findIndex((friendItem) => {
  //     return friendItem != null && friendItem.id === otherUser.id
  //   })
  //   if (patchedFriendIndex === -1) {
  //     return s.friends.friends.set([...s.friends.friends.value, otherUser])
  //   } else {
  //     return s.friends.friends[patchedFriendIndex].set(otherUser)
  //   }
  // })
  // .when(FriendAction.removedFriendAction.matches, (action) => {
  //   const otherUserId =
  //     action.userRelationship.userId === action.selfUser.id
  //       ? action.userRelationship.relatedUserId
  //       : action.userRelationship.userId

  //   const friendId = s.friends.friends.value.findIndex((friendItem) => {
  //     return friendItem != null && friendItem.id === otherUserId
  //   })

  //   return s.friends.friends[friendId].set(none)
  // })
}

export const accessFriendState = () => getState(FriendState)

export const useFriendState = () => useState(accessFriendState())

//Service
export const FriendService = {
  getUserRelationship: async (userId: string) => {
    try {
      dispatchAction(FriendAction.fetchingFriendsAction({}))

      const relationships: Relationship = await API.instance.client.service('user-relationship').find({
        query: {
          userId
        }
      })
      dispatchAction(FriendAction.loadedFriendsAction({ relationships }))
    } catch (err) {
      logger.error(err)
    }
  },
  requestFriend: (relatedUserId: string) => {
    return createRelation(relatedUserId, 'requested')
  },
  blockUser: (relatedUserId: string) => {
    return createRelation(relatedUserId, 'blocking')
  },
  acceptFriend: (relatedUserId: string) => {
    API.instance.client
      .service('user-relationship')
      .patch(relatedUserId, {
        userRelationshipType: 'friend'
      })
      .then((res: any) => {
        console.log(res)
        // dispatchAction(FriendAction.changedRelationAction({}))
      })
      .catch((err: any) => {
        logger.error(err)
      })
  },
  declineFriend: (relatedUserId: string) => {
    return removeRelation(relatedUserId)
  },
  unfriend: (relatedUserId: string) => {
    return removeRelation(relatedUserId)
  },
  useAPIListeners: () => {
    useEffect(() => {
      const userRelationshipCreatedListener = (params) => {
        if (params.userRelationship.userRelationshipType === 'friend') {
          dispatchAction(FriendAction.createdFriendAction({ userRelationship: params.userRelationship }))
        }
      }

      const userRelationshipPatchedListener = (params) => {
        const patchedUserRelationship = params.userRelationship
        const selfUser = accessAuthState().user
        if (patchedUserRelationship.userRelationshipType === 'friend') {
          dispatchAction(
            FriendAction.patchedFriendAction({ userRelationship: patchedUserRelationship, selfUser: selfUser.value })
          )
          if (
            patchedUserRelationship.user.channelInstanceId != null &&
            patchedUserRelationship.user.channelInstanceId === selfUser.channelInstanceId.value
          )
            dispatchAction(UserAction.addedChannelLayerUserAction({ user: patchedUserRelationship.user }))
          if (patchedUserRelationship.user.channelInstanceId !== selfUser.channelInstanceId.value)
            dispatchAction(UserAction.removedChannelLayerUserAction({ user: patchedUserRelationship.user }))
        }
      }

      const userRelationshipRemovedListener = (params) => {
        const deletedUserRelationship = params.userRelationship
        const selfUser = accessAuthState().user
        if (deletedUserRelationship.userRelationshipType === 'friend') {
          dispatchAction(
            FriendAction.removedFriendAction({ userRelationship: deletedUserRelationship, selfUser: selfUser.value })
          )
          if (
            deletedUserRelationship.user.channelInstanceId != null &&
            deletedUserRelationship.user.channelInstanceId === selfUser.channelInstanceId.value
          )
            dispatchAction(UserAction.addedChannelLayerUserAction({ user: deletedUserRelationship.user }))
          if (deletedUserRelationship.user.channelInstanceId !== selfUser.channelInstanceId.value)
            dispatchAction(UserAction.removedChannelLayerUserAction({ user: deletedUserRelationship.user }))
        }
      }

      API.instance.client.service('user-relationship').on('created', userRelationshipCreatedListener)
      API.instance.client.service('user-relationship').on('patched', userRelationshipPatchedListener)
      API.instance.client.service('user-relationship').on('removed', userRelationshipRemovedListener)

      return () => {
        API.instance.client.service('user-relationship').off('created', userRelationshipCreatedListener)
        API.instance.client.service('user-relationship').off('patched', userRelationshipPatchedListener)
        API.instance.client.service('user-relationship').off('removed', userRelationshipRemovedListener)
      }
    }, [])
  }
}

function createRelation(relatedUserId: string, type: 'requested' | 'blocking') {
  API.instance.client
    .service('user-relationship')
    .create({
      relatedUserId,
      userRelationshipType: type
    })
    .then((res: any) => {
      console.log(res)
      // dispatchAction(FriendAction.changedRelationAction({}))
    })
    .catch((err: any) => {
      logger.error(err)
    })
}

function removeRelation(relatedUserId: string) {
  API.instance.client
    .service('user-relationship')
    .remove(relatedUserId)
    .then((res: any) => {
      console.log(res)
      // dispatchAction(UserAction.changedRelationAction({}))
    })
    .catch((err: any) => {
      logger.error(err)
    })
}

//Action
export class FriendAction {
  static fetchingFriendsAction = defineAction({
    type: 'FETCHING_FRIENDS' as const
  })

  static loadedFriendsAction = defineAction({
    type: 'LOADED_FRIENDS' as const,
    relationships: matches.object as Validator<unknown, Relationship>
  })

  static createdFriendAction = defineAction({
    type: 'CREATED_FRIEND' as const,
    userRelationship: matches.object as Validator<unknown, UserRelationship>
  })

  static patchedFriendAction = defineAction({
    type: 'PATCHED_FRIEND' as const,
    userRelationship: matches.object as Validator<unknown, UserRelationship>,
    selfUser: matches.object as Validator<unknown, UserInterface>
  })

  static removedFriendAction = defineAction({
    type: 'REMOVED_FRIEND' as const,
    userRelationship: matches.object as Validator<unknown, UserRelationship>,
    selfUser: matches.object as Validator<unknown, UserInterface>
  })
}
