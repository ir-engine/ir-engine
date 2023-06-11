import i18n from 'i18next'
import { useEffect } from 'react'

import { Relationship } from '@etherealengine/common/src/interfaces/Relationship'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineAction, defineState, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:FriendService' })

//State
export const FriendState = defineState({
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
  const s = getMutableState(FriendState)
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

//Service
export const FriendService = {
  getUserRelationship: async (userId: string) => {
    try {
      dispatchAction(FriendAction.fetchingFriendsAction({}))

      const relationships: Relationship = await Engine.instance.api.service('user-relationship').find({
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
      await Engine.instance.api.service('user-relationship').patch(relatedUserId, {
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
        const selfUser = getState(AuthState).user
        if (params.userRelationshipType === 'requested' && selfUser.id === params.relatedUserId)
          NotificationService.dispatchNotify(`${params.user.name} ${i18n.t('user:friends.requestReceived')}`, {
            variant: 'success'
          })

        FriendService.getUserRelationship(selfUser.id)
      }
      const userRelationshipPatchedListener = (params) => {
        const selfUser = getState(AuthState).user

        if (params.userRelationshipType === 'friend' && selfUser.id === params.relatedUserId) {
          NotificationService.dispatchNotify(`${params.user.name} ${i18n.t('user:friends.requestAccepted')}`, {
            variant: 'success'
          })
        }

        FriendService.getUserRelationship(selfUser.id)
      }
      const userRelationshipRemovedListener = () => {
        const selfUser = getState(AuthState).user
        FriendService.getUserRelationship(selfUser.id)
      }

      Engine.instance.api.service('user-relationship').on('created', userRelationshipCreatedListener)
      Engine.instance.api.service('user-relationship').on('patched', userRelationshipPatchedListener)
      Engine.instance.api.service('user-relationship').on('removed', userRelationshipRemovedListener)

      return () => {
        Engine.instance.api.service('user-relationship').off('created', userRelationshipCreatedListener)
        Engine.instance.api.service('user-relationship').off('patched', userRelationshipPatchedListener)
        Engine.instance.api.service('user-relationship').off('removed', userRelationshipRemovedListener)
      }
    }, [])
  }
}

async function createRelation(userId: string, relatedUserId: string, type: 'requested' | 'blocking') {
  try {
    await Engine.instance.api.service('user-relationship').create({
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
    await Engine.instance.api.service('user-relationship').remove(relatedUserId)

    FriendService.getUserRelationship(userId)
  } catch (err) {
    logger.error(err)
  }
}

//Action
export class FriendAction {
  static fetchingFriendsAction = defineAction({
    type: 'ee.client.Friend.FETCHING_FRIENDS' as const
  })

  static loadedFriendsAction = defineAction({
    type: 'ee.client.Friend.LOADED_FRIENDS' as const,
    relationships: matches.object as Validator<unknown, Relationship>
  })
}
