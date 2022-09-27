import i18n from 'i18next'
import { useEffect } from 'react'

import { Relationship } from '@xrengine/common/src/interfaces/Relationship'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:FriendService' })

//State
const FriendState = defineState({
  name: 'FriendState',
  initial: () => ({
    relationships: {
      blocked: [] as Array<UserInterface>,
      blocking: [] as Array<UserInterface>,
      friend: [] as Array<UserInterface>,
      requested: [] as Array<UserInterface>,
      pending: [] as Array<UserInterface>
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
        requested: action.relationships.requested,
        pending: action.relationships.pending
      })
      s.updateNeeded.set(false)
      s.isFetching.set(false)
      return
    })
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
  requestFriend: (userId: string, relatedUserId: string) => {
    return createRelation(userId, relatedUserId, 'requested')
  },
  acceptFriend: async (userId: string, relatedUserId: string) => {
    try {
      await API.instance.client.service('user-relationship').patch(relatedUserId, {
        userRelationshipType: 'friend'
      })

      FriendService.getUserRelationship(userId)
    } catch (err) {
      logger.error(err)
    }
  },
  declineFriend: (userId: string, relatedUserId: string) => {
    return removeRelation(userId, relatedUserId)
  },
  unfriend: (userId: string, relatedUserId: string) => {
    return removeRelation(userId, relatedUserId)
  },
  blockUser: async (userId: string, relatedUserId: string) => {
    return createRelation(userId, relatedUserId, 'blocking')
  },
  unblockUser: (userId: string, relatedUserId: string) => {
    return removeRelation(userId, relatedUserId)
  },
  useAPIListeners: () => {
    useEffect(() => {
      const userRelationshipCreatedListener = (params) => {
        const userRelationship = params.userRelationship
        const selfUser = accessAuthState().user

        if (
          userRelationship.userRelationshipType === 'requested' &&
          selfUser.id.value === userRelationship.relatedUserId
        ) {
          NotificationService.dispatchNotify(
            `${userRelationship.user.name} ${i18n.t('user:friends.requestReceived')}`,
            {
              variant: 'success'
            }
          )
        }

        FriendService.getUserRelationship(selfUser.id.value)
      }
      const userRelationshipPatchedListener = (params) => {
        const userRelationship = params.userRelationship
        const selfUser = accessAuthState().user

        if (
          userRelationship.userRelationshipType === 'friend' &&
          selfUser.id.value === userRelationship.relatedUserId
        ) {
          NotificationService.dispatchNotify(
            `${userRelationship.user.name} ${i18n.t('user:friends.requestAccepted')}`,
            {
              variant: 'success'
            }
          )
        }

        FriendService.getUserRelationship(selfUser.id.value)
      }
      const userRelationshipRemovedListener = () => {
        const selfUser = accessAuthState().user
        FriendService.getUserRelationship(selfUser.id.value)
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

async function createRelation(userId: string, relatedUserId: string, type: 'requested' | 'blocking') {
  try {
    await API.instance.client.service('user-relationship').create({
      relatedUserId,
      userRelationshipType: type
    })

    FriendService.getUserRelationship(userId)
  } catch (err) {
    logger.error(err)
  }
}

async function removeRelation(userId: string, relatedUserId: string) {
  try {
    await API.instance.client.service('user-relationship').remove(relatedUserId)

    FriendService.getUserRelationship(userId)
  } catch (err) {
    logger.error(err)
  }
}

//Action
export class FriendAction {
  static fetchingFriendsAction = defineAction({
    type: 'xre.client.Friend.FETCHING_FRIENDS' as const
  })

  static loadedFriendsAction = defineAction({
    type: 'xre.client.Friend.LOADED_FRIENDS' as const,
    relationships: matches.object as Validator<unknown, Relationship>
  })
}
