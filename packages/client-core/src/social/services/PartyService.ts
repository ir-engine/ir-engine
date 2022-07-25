import { Paginated } from '@feathersjs/feathers'
// TODO: Reenable me! But decoupled so we don't need to import this lib
// import { endVideoChat } from '@xrengine/client-networking/src/transports/SocketWebRTCClientFunctions';
import i18n from 'i18next'
import { useEffect } from 'react'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { Party } from '@xrengine/common/src/interfaces/Party'
import { PartyUser } from '@xrengine/common/src/interfaces/PartyUser'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import {
  accessMediaInstanceConnectionState,
  MediaInstanceConnectionService
} from '../../common/services/MediaInstanceConnectionService'
import { NotificationService } from '../../common/services/NotificationService'
import { endVideoChat, leaveNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import { accessAuthState } from '../../user/services/AuthService'
import { UserAction } from '../../user/services/UserService'
import { accessChatState, ChatAction, ChatService } from './ChatService'
import { InviteService } from './InviteService'

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

const loadedPartyReceptor = (action: typeof PartyActions.loadedPartyAction.matches._TYPE) => {
  const state = getState(PartyState)
  return state.merge({ party: action.party, isOwned: action.isOwned, updateNeeded: false })
}

const createdPartyReceptor = (action: typeof PartyActions.createdPartyAction.matches._TYPE) => {
  const state = getState(PartyState)
  return state.merge({ party: action.party, updateNeeded: true })
}

const removedPartyReceptor = (action: typeof PartyActions.removedPartyAction.matches._TYPE) => {
  const state = getState(PartyState)
  return state.merge({ party: null!, updateNeeded: true })
}

const invitedPartyUserReceptor = (action: typeof PartyActions.invitedPartyUserAction.matches._TYPE) => {
  const state = getState(PartyState)
  return state.updateNeeded.set(true)
}

const createdPartyUserReceptor = (action: typeof PartyActions.createdPartyUserAction.matches._TYPE) => {
  const state = getState(PartyState)
  if (state.party && state.party.partyUsers && state.party.partyUsers.value) {
    const users = JSON.parse(JSON.stringify(state.party.partyUsers.value)) as PartyUser[]
    const index = users.findIndex((partyUser) => partyUser?.id === action.partyUser.id)

    if (index > -1) users[index] = action.partyUser
    else users.push(action.partyUser)

    return state.party.merge({ partyUsers: users })
  }
  state.updateNeeded.set(true)
}

const changedPartyReceptor = (action: typeof PartyActions.changedPartyAction.matches._TYPE) => {
  const state = getState(PartyState)
  return state.updateNeeded.set(true)
}

const patchedPartyUserReceptor = (action: typeof PartyActions.patchedPartyUserAction.matches._TYPE) => {
  const state = getState(PartyState)
  if (state.party && state.party.partyUsers && state.party.partyUsers.value) {
    const users = JSON.parse(JSON.stringify(state.party.partyUsers.value)) as PartyUser[]
    const index = users.findIndex((partyUser) => partyUser?.id === action.partyUser.id)

    if (index > -1) {
      users[index] = action.partyUser
      return state.party.merge({ partyUsers: users })
    }
  }
  state.updateNeeded.set(true)
}

const resetUpdateNeededReceptor = (action: typeof PartyActions.resetUpdateNeededAction.matches._TYPE) => {
  const state = getState(PartyState)
  return state.updateNeeded.set(false)
}

const removedPartyUserReceptor = (action: typeof PartyActions.removedPartyUserAction.matches._TYPE) => {
  const state = getState(PartyState)

  if (action.partyUser.userId === accessAuthState().user.id.value) state.merge({ party: null!, isOwned: false })

  if (state.party && state.party.partyUsers && state.party.partyUsers.value) {
    const index = state.party.partyUsers.value.findIndex((partyUser) => partyUser?.id === action.partyUser.id)
    if (index > -1) {
      const users = JSON.parse(JSON.stringify(state.party.partyUsers.value))
      users.splice(index, 1)
      return state.party.merge({ partyUsers: users })
    }
  }
}

export const PartyServiceReceptors = {
  loadedPartyReceptor,
  createdPartyReceptor,
  removedPartyReceptor,
  invitedPartyUserReceptor,
  createdPartyUserReceptor,
  patchedPartyUserReceptor,
  removedPartyUserReceptor,
  changedPartyReceptor,
  resetUpdateNeededReceptor
}

export const accessPartyState = () => getState(PartyState)

export const usePartyState = () => useState(accessPartyState())

//Service
export const PartyService = {
  getParty: async () => {
    try {
      const partyResult = (await API.instance.client.service('party').get('')) as Party
      if (partyResult) {
        partyResult.partyUsers = partyResult.party_users
        dispatchAction(
          PartyActions.loadedPartyAction({
            party: partyResult,
            isOwned:
              accessAuthState().user.id.value ===
              (partyResult.partyUsers && partyResult.partyUsers.find((user) => user.isOwner)?.userId)
          })
        )
      } else {
        dispatchAction(PartyActions.resetUpdateNeededAction({}))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  createParty: async () => {
    try {
      const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
      await endVideoChat(network, {})
      leaveNetwork(network)
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
      dispatchAction(PartyActions.removedPartyAction({ party }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  inviteToParty: async (partyId: string, userId: string) => {
    try {
      const sendData = {
        inviteType: 'party',
        inviteeId: userId,
        targetObjectId: partyId
      } as SendInvite
      await InviteService.sendInvite(sendData)
      NotificationService.dispatchNotify(i18n.t('social:partyInvitationSent'), {
        variant: 'success'
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removePartyUser: async (partyUserId: string) => {
    try {
      await API.instance.client.service('party-user').remove(partyUserId)
      const selfUser = accessAuthState().user.value
      if (partyUserId === selfUser.id) await PartyService.leaveNetwork(true)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  leaveNetwork: async (joinInstanceChannelServer = false) => {
    const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    await endVideoChat(network, {})
    leaveNetwork(network)
    if (joinInstanceChannelServer && !accessMediaInstanceConnectionState().acceptingPartyInvite.value) {
      const channels = accessChatState().channels.channels.value
      const instanceChannel = Object.values(channels).find(
        (channel) => channel.instanceId === Engine.instance.currentWorld.worldNetwork?.hostId
      )
      if (instanceChannel) await MediaInstanceConnectionService.provisionServer(instanceChannel?.id!, true)
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
        if (accessPartyState().party.value == null) {
          dispatchAction(PartyActions.changedPartyAction({}))
        }

        if (
          params.partyUser.userId !== accessAuthState().user.id.value ||
          (params.partyUser.userId === accessAuthState().user.id.value &&
            params.partyUser.partyId === accessPartyState().party?.id?.value)
        )
          dispatchAction(PartyActions.createdPartyUserAction({ partyUser: params.partyUser }))
        else {
          dispatchAction(ChatAction.refetchPartyChannelAction({}))
          dispatchAction(PartyActions.changedPartyAction({}))
        }

        // if (params.partyUser.userId === selfUser.id.value) {
        //   const party = await API.instance.client.service('party').get(params.partyUser.partyId)
        //   const userId = selfUser.id.value ?? ''
        //   const dbUser = (await API.instance.client.service('user').get(userId)) as UserInterface
        //   if (party.instanceId != null && party.instanceId !== dbUser.instanceId) {
        //     const updateUser: PartyUser = {
        //       ...params.partyUser,
        //       user: dbUser
        //     }
        //     updateUser.partyId = party.id
        //     dispatchAction(PartyActions.patchedPartyUserAction({ partyUser: updateUser }))
        //     await MediaInstanceConnectionService.provisionServer(party.instanceId, false)
        //   }
        // }
      }

      const partyUserPatchedListener = (params) => {
        const updatedPartyUser = params.partyUser
        const selfUser = accessAuthState().user
        dispatchAction(PartyActions.patchedPartyUserAction({ partyUser: updatedPartyUser }))
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
        const selfUser = accessAuthState().user.value
        dispatchAction(PartyActions.removedPartyUserAction({ partyUser: deletedPartyUser }))
        // dispatchAction(UserAction.removedChannelLayerUserAction({ user: deletedPartyUser.user }))
        if (deletedPartyUser.userId === selfUser.id) {
          dispatchAction(ChatAction.refetchPartyChannelAction({}))
          NotificationService.dispatchNotify('You have left the party', { variant: 'warning' })
          if (selfUser.partyId === deletedPartyUser.partyId) PartyService.leaveNetwork(true)
          ChatService.clearChatTargetIfCurrent('party', {
            id: params.partyUser.partyId
          })
        }
      }

      const partyCreatedListener = (params) => {
        params.party.partyUsers = params.party.party_users
        dispatchAction(ChatAction.refetchPartyChannelAction({}))
        dispatchAction(PartyActions.createdPartyAction({ party: params.party }))
      }

      const partyPatchedListener = (params) => {
        dispatchAction(PartyActions.patchedPartyAction({ party: params.party }))
        ChatService.clearChatTargetIfCurrent('party', params.party)
      }

      const partyRemovedListener = (params) => {
        dispatchAction(ChatAction.refetchPartyChannelAction({}))
        dispatchAction(PartyActions.removedPartyAction({ party: params.party }))
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

export class PartyActions {
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

  static changedPartyAction = defineAction({
    type: 'CHANGED_PARTY' as const
  })

  static resetUpdateNeededAction = defineAction({
    type: 'RESET_UPDATE_NEEDED' as const
  })
}
