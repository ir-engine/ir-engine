import { Paginated } from '@feathersjs/feathers'
// TODO: Reenable me! But decoupled so we don't need to import this lib
// import { endVideoChat } from '@xrengine/client-networking/src/transports/SocketWebRTCClientFunctions';
import i18n from 'i18next'
import { useEffect } from 'react'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { Party } from '@xrengine/common/src/interfaces/Party'
import { PartyUser } from '@xrengine/common/src/interfaces/PartyUser'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { MediaInstanceConnectionService } from '../../common/services/MediaInstanceConnectionService'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'
import { UserAction } from '../../user/services/UserService'
import { ChatService } from './ChatService'

const logger = multiLogger.child({ component: 'client-core:social' })

// State
const PartyState = defineState({
  name: 'PartyState',
  initial: () => ({
    party: null! as Party,
    isOwned: false,
    updateNeeded: true
  })
})

export const PartyServiceReceptor = (action) => {
  getState(PartyState).batch((s) => {
    matches(action)
      .when(PartyAction.loadedPartyAction.matches, (action) => {
        s.merge({ party: action.party, isOwned: action.isOwned, updateNeeded: false })
      })
      .when(PartyAction.createdPartyAction.matches, (action) => {
        s.merge({ party: action.party, updateNeeded: true })
      })
      .when(PartyAction.removedPartyAction.matches, () => {
        s.merge({ party: null!, updateNeeded: true })
      })
      .when(PartyAction.invitedPartyUserAction.matches, () => {
        s.updateNeeded.set(true)
      })
      .when(PartyAction.createdPartyUserAction.matches, (action) => {
        const index = s.party?.partyUsers?.value
          ? s.party.partyUsers.findIndex((layerUser) => {
              return layerUser != null && layerUser.id.value === action.partyUser.id
            })
          : -1
        if (index === -1) {
          s.party.partyUsers.merge([action.partyUser])
        } else {
          s.party.partyUsers[index].set(action.partyUser)
        }
        s.updateNeeded.set(true)
      })
      .when(PartyAction.patchedPartyUserAction.matches, (action) => {
        const index = s.party?.partyUsers?.value
          ? s.party.partyUsers.findIndex((layerUser) => {
              return layerUser != null && layerUser.id.value === action.partyUser.id
            })
          : -1
        if (index === -1) {
          s.party.partyUsers.merge([action.partyUser])
        } else {
          s.party.partyUsers[index].set(action.partyUser)
        }
        s.updateNeeded.set(true)
      })
      .when(PartyAction.removedPartyUserAction.matches, (action) => {
        if (s.party && s.party.partyUsers && s.party.partyUsers.value) {
          const matchingPartyUserIndex = s.party.partyUsers.value.findIndex(
            (partyUser) => partyUser?.id === action.partyUser.id
          )
          if (matchingPartyUserIndex > -1)
            return s.party.partyUsers.set(s.party.partyUsers.value.splice(matchingPartyUserIndex, 1))
        }
      })
  })
}

export const accessPartyState = () => getState(PartyState)

export const usePartyState = () => useState(accessPartyState())

//Service
export const PartyService = {
  getParty: async () => {
    try {
      const partyResult = (await API.instance.client.service('party').get('')) as Party
      dispatchAction(
        PartyAction.loadedPartyAction({
          party: partyResult,
          isOwned:
            accessAuthState().authUser.identityProvider.userId.value ===
            partyResult.partyUsers.find((user) => user.isOwner)?.userId
        })
      )
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },

  getParties: async (): Promise<void> => {
    let socketId: any
    if (API.instance.client.io && socketId === undefined) {
      API.instance.client.io.emit('request-user-id', ({ id }: { id: number }) => {
        socketId = id
      })
      ;(window as any).joinParty = (userId: number, partyId: number) => {
        API.instance.client.io.emit('join-party', {
          userId,
          partyId
        })
      }
      ;(window as any).messageParty = (userId: number, partyId: number, message: string) => {
        API.instance.client.io.emit('message-party-request', {
          userId,
          partyId,
          message
        })
      }
      ;(window as any).partyInit = (userId: number) => {
        API.instance.client.io.emit('party-init', { userId })
      }
    }
  },
  createParty: async () => {
    try {
      await API.instance.client.service('party').create()
      PartyService.getParty()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeParty: async (partyId: string) => {
    try {
      const channelResult = (await API.instance.client.service('channel').find({
        query: {
          channelType: 'party',
          partyId: partyId
        }
      })) as Paginated<Channel>
      if (channelResult.total > 0) {
        await API.instance.client.service('channel').remove(channelResult.data[0].id)
      }
      const party = (await API.instance.client.service('party').remove(partyId)) as Party
      dispatchAction(PartyAction.removedPartyAction({ party }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  inviteToParty: async (partyId: string, userId: string) => {
    try {
      const result = await API.instance.client.service('party-user').create({
        partyId,
        userId
      })
      NotificationService.dispatchNotify(i18n.t('social:partyInvitationSent'), {
        variant: 'success'
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getPartyUsers: async () => {
    try {
      const results = await API.instance.client.service('party-user').find()
      console.debug(results)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removePartyUser: async (partyUserId: string) => {
    try {
      await API.instance.client.service('party-user').remove(partyUserId)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  transferPartyOwner: async (partyUserId: string) => {
    try {
      await API.instance.client.service('party-user').patch(partyUserId, {
        isOwner: true
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  useAPIListeners: () => {
    useEffect(() => {
      const partyUserCreatedListener = async (params) => {
        const selfUser = accessAuthState().user
        if (accessPartyState().party.value == null) {
          dispatchAction(PartyAction.createdPartyAction({ party: params }))
        }
        dispatchAction(PartyAction.createdPartyUserAction({ partyUser: params.partyUser }))
        if (params.partyUser.userId === selfUser.id.value) {
          const party = await API.instance.client.service('party').get(params.partyUser.partyId)
          const userId = selfUser.id.value ?? ''
          const dbUser = (await API.instance.client.service('user').get(userId)) as UserInterface
          if (party.instanceId != null && party.instanceId !== dbUser.instanceId) {
            const updateUser: PartyUser = {
              ...params.partyUser,
              user: dbUser
            }
            updateUser.partyId = party.id
            dispatchAction(PartyAction.patchedPartyUserAction({ partyUser: updateUser }))
            await MediaInstanceConnectionService.provisionServer(party.instanceId, false)
          }
        }
      }

      const partyUserPatchedListener = (params) => {
        const updatedPartyUser = params.partyUser
        const selfUser = accessAuthState().user
        dispatchAction(PartyAction.patchedPartyUserAction({ partyUser: updatedPartyUser }))
        if (
          updatedPartyUser.user.channelInstanceId != null &&
          updatedPartyUser.user.channelInstanceId === selfUser.channelInstanceId.value
        )
          dispatchAction(UserAction.addedChannelLayerUserAction({ user: updatedPartyUser.user }))
        if (updatedPartyUser.user.channelInstanceId !== selfUser.channelInstanceId.value)
          dispatchAction(
            UserAction.removedChannelLayerUserAction({
              user: updatedPartyUser.user
            })
          )
      }

      const partyUserRemovedListener = (params) => {
        const deletedPartyUser = params.partyUser
        const selfUser = accessAuthState().user
        dispatchAction(PartyAction.removedPartyUserAction({ partyUser: deletedPartyUser }))
        dispatchAction(UserAction.removedChannelLayerUserAction({ user: deletedPartyUser.user }))
        if (params.partyUser.userId === selfUser.id) {
          ChatService.clearChatTargetIfCurrent('party', {
            id: params.partyUser.partyId
          })
          // TODO: Reenable me!
          // endVideoChat({ leftParty: true });
        }
      }

      const partyCreatedListener = (params) => {
        dispatchAction(PartyAction.createdPartyAction({ party: params.party }))
      }

      const partyPatchedListener = (params) => {
        dispatchAction(PartyAction.patchedPartyAction({ party: params.party }))
        ChatService.clearChatTargetIfCurrent('party', params.party)
      }

      const partyRemovedListener = (params) => {
        dispatchAction(PartyAction.removedPartyAction({ party: params.party }))
      }

      API.instance.client.service('party-user').on('created', partyUserCreatedListener)
      API.instance.client.service('party-user').on('patched', partyUserPatchedListener)
      API.instance.client.service('party-user').on('removed', partyUserRemovedListener)
      API.instance.client.service('party').on('created', partyCreatedListener)
      API.instance.client.service('party').on('patched', partyPatchedListener)
      API.instance.client.service('party').on('removed', partyRemovedListener)

      return () => {
        API.instance.client.service('party-user').off('created', partyUserCreatedListener)
        API.instance.client.service('party-user').off('patched', partyUserPatchedListener)
        API.instance.client.service('party-user').off('removed', partyUserRemovedListener)
        API.instance.client.service('party').off('created', partyCreatedListener)
        API.instance.client.service('party').off('patched', partyPatchedListener)
        API.instance.client.service('party').off('removed', partyRemovedListener)
      }
    }, [])
  }
}

//Action

export class PartyAction {
  static loadedPartyAction = defineAction({
    type: 'LOADED_PARTY' as const,
    party: matches.object as Validator<unknown, Party>,
    isOwned: matches.boolean
  })

  static createdPartyAction = defineAction({
    type: 'CREATED_PARTY' as const,
    party: matches.object as Validator<unknown, Party>
  })

  static patchedPartyAction = defineAction({
    type: 'PATCHED_PARTY' as const,
    party: matches.object as Validator<unknown, Party>
  })

  static removedPartyAction = defineAction({
    type: 'REMOVED_PARTY' as const,
    party: matches.object as Validator<unknown, Party>
  })

  static invitedPartyUserAction = defineAction({
    type: 'INVITED_PARTY_USER' as const
  })

  static leftPartyAction = defineAction({
    type: 'LEFT_PARTY' as const
  })

  static createdPartyUserAction = defineAction({
    type: 'CREATED_PARTY_USER' as const,
    partyUser: matches.object as Validator<unknown, PartyUser>
  })

  static patchedPartyUserAction = defineAction({
    type: 'PATCHED_PARTY_USER' as const,
    partyUser: matches.object as Validator<unknown, PartyUser>
  })

  static removedPartyUserAction = defineAction({
    type: 'REMOVED_PARTY_USER' as const,
    partyUser: matches.object as Validator<unknown, PartyUser>
  })
}
