import { Paginated } from '@feathersjs/feathers'
// TODO: Reenable me! But decoupled so we don't need to import this lib
// import { endVideoChat } from '@xrengine/client-networking/src/transports/SocketWebRTCClientFunctions';
import i18n from 'i18next'
import _ from 'lodash'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { Party } from '@xrengine/common/src/interfaces/Party'
import { PartyUser } from '@xrengine/common/src/interfaces/PartyUser'
import { User } from '@xrengine/common/src/interfaces/User'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'
import { store } from '../../store'
import { accessAuthState } from '../../user/services/AuthService'
import { UserAction } from '../../user/services/UserService'
import { ChatService } from './ChatService'

const logger = multiLogger.child({ component: 'client-core:social' })

// State
const PartyState = defineState({
  name: 'PartyState',
  initial: () => ({
    party: {} as Party,
    updateNeeded: true
  })
})

export const PartyServiceReceptor = (action) => {
  getState(PartyState).batch((s) => {
    matches(action)
      .when(PartyAction.loadedPartyAction.matches, (action) => {
        return s.merge({ party: action.party, updateNeeded: false })
      })
      .when(PartyAction.createdPartyAction.matches, () => {
        return s.updateNeeded.set(true)
      })
      .when(PartyAction.removedPartyAction.matches, () => {
        return s.merge({ party: {}, updateNeeded: true })
      })
      .when(PartyAction.invitedPartyUserAction.matches, () => {
        return s.updateNeeded.set(true)
      })
      .when(PartyAction.createdPartyUserAction.matches, (action) => {
        const updateMap = _.cloneDeep(s.party.value)
        if (updateMap != null) {
          updateMap.partyUsers = Array.isArray(updateMap.partyUsers)
            ? updateMap.partyUsers.find((pUser) => {
                return pUser != null && pUser.id === action.partyUser.id
              }) == null
              ? updateMap.partyUsers.concat([action.partyUser])
              : updateMap.partyUsers.map((pUser) => {
                  return pUser != null && pUser.id === action.partyUser.id ? action.partyUser : pUser
                })
            : [action.partyUser]
        }
        return s.merge({ party: updateMap, updateNeeded: true })
      })
      .when(PartyAction.patchedPartyUserAction.matches, (action) => {
        const updateMap = _.cloneDeep(s.party.value)
        if (updateMap != null) {
          updateMap.partyUsers = Array.isArray(updateMap.partyUsers)
            ? updateMap.partyUsers.find((pUser) => {
                return pUser != null && pUser.id === action.partyUser.id
              }) == null
              ? updateMap.partyUsers.concat([action.partyUser])
              : updateMap.partyUsers.map((pUser) => {
                  return pUser != null && pUser.id === action.partyUser.id ? action.partyUser : pUser
                })
            : [action.partyUser]
        }
        return s.party.set(updateMap)
      })
      .when(PartyAction.removedPartyUserAction.matches, (action) => {
        const updateMap = _.cloneDeep(s.party.value)
        if (updateMap != null) {
          updateMap.partyUsers &&
            _.remove(updateMap.partyUsers, (pUser: PartyUser) => {
              return pUser != null && action.partyUser.id === pUser.id
            })
        }
        s.party.set(updateMap)
        return s.updateNeeded.set(true)
      })
  })
}

export const accessPartyState = () => getState(PartyState)

export const usePartyState = () => useState(accessPartyState())

//Service
export const PartyService = {
  getParty: async () => {
    try {
      // console.log('CALLING GETPARTY()');
      const partyResult = (await client.service('party').get('')) as Party
      dispatchAction(PartyAction.loadedPartyAction({ party: partyResult }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  // Temporary Method for arbitrary testing
  getParties: async (): Promise<void> => {
    let socketId: any
    if (client.io && socketId === undefined) {
      client.io.emit('request-user-id', ({ id }: { id: number }) => {
        socketId = id
      })
      ;(window as any).joinParty = (userId: number, partyId: number) => {
        client.io.emit('join-party', {
          userId,
          partyId
        })
      }
      ;(window as any).messageParty = (userId: number, partyId: number, message: string) => {
        client.io.emit('message-party-request', {
          userId,
          partyId,
          message
        })
      }
      ;(window as any).partyInit = (userId: number) => {
        client.io.emit('party-init', { userId })
      }
    }
  },
  createParty: async () => {
    try {
      await client.service('party').create({})
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeParty: async (partyId: string) => {
    try {
      const channelResult = (await client.service('channel').find({
        query: {
          channelType: 'party',
          partyId: partyId
        }
      })) as Paginated<Channel>
      if (channelResult.total > 0) {
        await client.service('channel').remove(channelResult.data[0].id)
      }
      const party = (await client.service('party').remove(partyId)) as Party
      dispatchAction(PartyAction.removedPartyAction({ party }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  inviteToParty: async (partyId: string, userId: string) => {
    try {
      const result = await client.service('party-user').create({
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
  removePartyUser: async (partyUserId: string) => {
    try {
      await client.service('party-user').remove(partyUserId)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  transferPartyOwner: async (partyUserId: string) => {
    try {
      await client.service('party-user').patch(partyUserId, {
        isOwner: true
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

if (globalThis.process.env['VITE_OFFLINE_MODE'] !== 'true') {
  client.service('party-user').on('created', async (params) => {
    const selfUser = accessAuthState().user
    if (accessPartyState().party == null) {
      dispatchAction(PartyAction.createdPartyAction({ party: params }))
    }
    dispatchAction(PartyAction.createdPartyUserAction({ partyUser: params.partyUser }))
    if (params.partyUser.userId === selfUser.id.value) {
      const party = await client.service('party').get(params.partyUser.partyId)
      const userId = selfUser.id.value ?? ''
      const dbUser = (await client.service('user').get(userId)) as User
      if (party.instanceId != null && party.instanceId !== dbUser.instanceId) {
        const updateUser: PartyUser = {
          ...params.partyUser,
          user: dbUser
        }
        updateUser.partyId = party.id
        dispatchAction(PartyAction.patchedPartyUserAction({ partyUser: updateUser }))
        // TODO: Reenable me!
        // await provisionServer(instance.locationId, instance.id)(store.dispatch, store.getState);
      }
    }
  })

  client.service('party-user').on('patched', (params) => {
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
  })

  client.service('party-user').on('removed', (params) => {
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
  })

  client.service('party').on('created', (params) => {
    dispatchAction(PartyAction.createdPartyAction({ party: params.party }))
  })

  client.service('party').on('patched', (params) => {
    dispatchAction(PartyAction.patchedPartyAction({ party: params.party }))
    ChatService.clearChatTargetIfCurrent('party', params.party)
  })

  client.service('party').on('removed', (params) => {
    dispatchAction(PartyAction.removedPartyAction({ party: params.party }))
  })
}

//Action

export class PartyAction {
  static loadedPartyAction = defineAction({
    type: 'LOADED_PARTY' as const,
    party: matches.object as Validator<unknown, Party>
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
