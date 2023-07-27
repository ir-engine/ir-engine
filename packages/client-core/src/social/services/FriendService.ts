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
