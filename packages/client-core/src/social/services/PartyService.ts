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

import { Paginated } from '@feathersjs/feathers'
import { t } from 'i18next'
import { useEffect } from 'react'

import { Channel } from '@etherealengine/common/src/interfaces/Channel'
import { SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import { Party } from '@etherealengine/common/src/interfaces/Party'
import { PartyUser } from '@etherealengine/common/src/interfaces/PartyUser'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import {
  defineAction,
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState
} from '@etherealengine/hyperflux'

import {
  MediaInstanceConnectionService,
  MediaInstanceState
} from '../../common/services/MediaInstanceConnectionService'
import { NotificationService } from '../../common/services/NotificationService'
import { endVideoChat, leaveNetwork, SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { AuthState } from '../../user/services/AuthService'
import { ChatAction, ChatService, ChatState } from './ChatService'
import { InviteService } from './InviteService'

// State
export const PartyState = defineState({
  name: 'PartyState',
  initial: () => ({
    party: null! as Party,
    isOwned: false,
    updateNeeded: true
  })
})

const loadedPartyReceptor = (action: typeof PartyActions.loadedPartyAction.matches._TYPE) => {
  const state = getMutableState(PartyState)
  return state.merge({ party: action.party, isOwned: action.isOwned, updateNeeded: false })
}

const createdPartyReceptor = (action: typeof PartyActions.createdPartyAction.matches._TYPE) => {
  const state = getMutableState(PartyState)
  return state.merge({ party: action.party, updateNeeded: true })
}

const removedPartyReceptor = (action: typeof PartyActions.removedPartyAction.matches._TYPE) => {
  const state = getMutableState(PartyState)
  return state.merge({ party: null!, updateNeeded: true })
}

const invitedPartyUserReceptor = (action: typeof PartyActions.invitedPartyUserAction.matches._TYPE) => {
  const state = getMutableState(PartyState)
  return state.updateNeeded.set(true)
}

const createdPartyUserReceptor = (action: typeof PartyActions.createdPartyUserAction.matches._TYPE) => {
  const state = getMutableState(PartyState)
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
  const state = getMutableState(PartyState)
  return state.updateNeeded.set(true)
}

const patchedPartyUserReceptor = (action: typeof PartyActions.patchedPartyUserAction.matches._TYPE) => {
  const state = getMutableState(PartyState)
  if (state.party && state.party.partyUsers && state.party.partyUsers.value) {
    const users = JSON.parse(JSON.stringify(state.party.partyUsers.value)) as PartyUser[]
    const index = users.findIndex((partyUser) => partyUser?.id === action.partyUser.id)
    const isOwned = getMutableState(AuthState).user.id.value === action.partyUser.userId && action.partyUser.isOwner

    state.isOwned.set(isOwned)
    if (index > -1) {
      users[index] = action.partyUser
      return state.party.merge({ partyUsers: users })
    }
  }
  state.updateNeeded.set(true)
}

const resetUpdateNeededReceptor = (action: typeof PartyActions.resetUpdateNeededAction.matches._TYPE) => {
  const state = getMutableState(PartyState)
  return state.updateNeeded.set(false)
}

const removedPartyUserReceptor = (action: typeof PartyActions.removedPartyUserAction.matches._TYPE) => {
  const state = getMutableState(PartyState)

  if (action.partyUser.userId === getMutableState(AuthState).user.id.value)
    state.merge({ party: null!, isOwned: false })

  if (state.party && state.party.partyUsers && state.party.partyUsers.value) {
    const index = state.party.partyUsers
      .get({ noproxy: true })
      ?.findIndex((partyUser) => partyUser?.id === action.partyUser.id)
    if (index && index > -1) {
      const users = JSON.parse(JSON.stringify(state.party.partyUsers.value))
      users.splice(index, 1)
      return state.party.partyUsers.set(users)
    }
  }
}

//Service
export const PartyService = {
  getParty: async () => {
    try {
      const partyResult = (await Engine.instance.api.service('party').get('')) as Party
      if (partyResult) {
        partyResult.partyUsers = partyResult.party_users
        dispatchAction(
          PartyActions.loadedPartyAction({
            party: partyResult,
            isOwned:
              getState(AuthState).user.id ===
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
      MediaInstanceConnectionService.setJoining(true)
      const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
      await endVideoChat(network, {})
      await leaveNetwork(network)
      await Engine.instance.api.service('party').create()
      PartyService.getParty()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeParty: async (partyId: string) => {
    try {
      const channelResult = (await Engine.instance.api.service('channel').find({
        query: {
          channelType: 'party',
          partyId: partyId
        }
      })) as Paginated<Channel>
      if (channelResult.total > 0) {
        await Engine.instance.api.service('channel').remove(channelResult.data[0].id)
      }
      const party = (await Engine.instance.api.service('party').remove(partyId)) as Party
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
      NotificationService.dispatchNotify(t('social:partyInvitationSent'), {
        variant: 'success'
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removePartyUser: async (partyUserId: string) => {
    try {
      await Engine.instance.api.service('party-user').remove(partyUserId)
      const selfUser = getState(AuthState).user
      if (partyUserId === selfUser.id) await PartyService.leaveNetwork(true)
    } catch (err) {
      console.log('remove party user error', err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  leaveNetwork: async (joinInstanceChannelServer = false) => {
    const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    if (!network) return
    await endVideoChat(network, {})
    await leaveNetwork(network)
    if (joinInstanceChannelServer && !getState(MediaInstanceState).joiningNonInstanceMediaChannel) {
      const channels = getState(ChatState).channels.channels
      const instanceChannel = Object.values(channels).find(
        (channel) => channel.instanceId === Engine.instance.worldNetwork?.hostId
      )
      MediaInstanceConnectionService.setJoining(true)
      if (instanceChannel) await MediaInstanceConnectionService.provisionServer(instanceChannel?.id!, true)
    }
  },
  transferPartyOwner: async (partyUserId: string) => {
    try {
      await Engine.instance.api.service('party-user').patch(partyUserId, {
        isOwner: true
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  useAPIListeners: () => {
    useEffect(() => {
      const partyUserCreatedListener = async (params) => {
        if (getState(PartyState).party == null) {
          dispatchAction(PartyActions.changedPartyAction({}))
        }

        if (
          params.userId !== getState(AuthState).user.id ||
          (params.userId === getState(AuthState).user.id && params.partyId === getState(PartyState).party?.id)
        ) {
          if (params.userId !== getState(AuthState).user.id) {
            const username = params.user ? params.user.name : 'A user'
            NotificationService.dispatchNotify(username + t('social:otherJoinedParty'), { variant: 'success' })
          }
          if (params.userId === getState(AuthState).user.id && params.partyId === getState(PartyState).party?.id)
            NotificationService.dispatchNotify(t('social:selfJoinedParty'), { variant: 'success' })
          dispatchAction(PartyActions.createdPartyUserAction({ partyUser: params }))
        } else {
          NotificationService.dispatchNotify(t('social:selfJoinedParty'), { variant: 'success' })
          dispatchAction(ChatAction.refetchPartyChannelAction({}))
          dispatchAction(PartyActions.changedPartyAction({}))
        }

        // if (params.userId === selfUser.id) {
        //   const party = await Engine.instance.api.service('party').get(params.partyId)
        //   const userId = selfUser.id ?? ''
        //   const dbUser = (await Engine.instance.api.service('user').get(userId)) as UserInterface
        //   if (party.instanceId != null && party.instanceId !== dbUser.instanceId) {
        //     const updateUser: PartyUser = {
        //       ...params,
        //       user: dbUser
        //     }
        //     updateUser.partyId = party.id
        //     dispatchAction(PartyActions.patchedPartyUserAction({ partyUser: updateUser }))
        //     await MediaInstanceConnectionService.provisionServer(party.instanceId, false)
        //   }
        // }
      }

      const partyUserPatchedListener = (params) => {
        dispatchAction(PartyActions.patchedPartyUserAction({ partyUser: params }))
      }

      const partyUserRemovedListener = async (params) => {
        const selfUser = getState(AuthState).user
        dispatchAction(PartyActions.removedPartyUserAction({ partyUser: params }))
        if (params.userId === selfUser.id) {
          dispatchAction(ChatAction.refetchPartyChannelAction({}))

          const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
          if (params.instance?.id === network?.hostId) {
            NotificationService.dispatchNotify(t('social:selfLeftParty'), { variant: 'warning' })
            await PartyService.leaveNetwork(true)
          }
          // ChatService.clearChatTargetIfCurrent('party', {
          //   id: params.partyId
          // })
        } else {
          const username = params.user ? params.user.name : 'A party user'
          NotificationService.dispatchNotify(username + t('social:otherLeftParty'), { variant: 'warning' })
        }
      }

      const partyCreatedListener = (party: Party) => {
        party.partyUsers = party.party_users
        dispatchAction(ChatAction.refetchPartyChannelAction({}))
        dispatchAction(PartyActions.createdPartyAction({ party }))
      }

      const partyPatchedListener = (party: Party) => {
        party.partyUsers = party.party_users
        dispatchAction(PartyActions.patchedPartyAction({ party }))
        ChatService.clearChatTargetIfCurrent('party', party)
      }

      const partyRemovedListener = (party: Party) => {
        party.partyUsers = party.party_users
        dispatchAction(ChatAction.refetchPartyChannelAction({}))
        dispatchAction(PartyActions.removedPartyAction({ party }))
      }

      Engine.instance.api.service('party-user').on('created', partyUserCreatedListener)
      Engine.instance.api.service('party-user').on('patched', partyUserPatchedListener)
      Engine.instance.api.service('party-user').on('removed', partyUserRemovedListener)
      Engine.instance.api.service('party').on('created', partyCreatedListener)
      Engine.instance.api.service('party').on('patched', partyPatchedListener)
      Engine.instance.api.service('party').on('removed', partyRemovedListener)

      return () => {
        Engine.instance.api.service('party-user').off('created', partyUserCreatedListener)
        Engine.instance.api.service('party-user').off('patched', partyUserPatchedListener)
        Engine.instance.api.service('party-user').off('removed', partyUserRemovedListener)
        Engine.instance.api.service('party').off('created', partyCreatedListener)
        Engine.instance.api.service('party').off('patched', partyPatchedListener)
        Engine.instance.api.service('party').off('removed', partyRemovedListener)
      }
    }, [])
  }
}

//Action

export class PartyActions {
  static loadedPartyAction = defineAction({
    type: 'ee.client.Party.LOADED_PARTY' as const,
    party: matches.object as Validator<unknown, Party>,
    isOwned: matches.boolean
  })

  static createdPartyAction = defineAction({
    type: 'ee.client.Party.CREATED_PARTY' as const,
    party: matches.object as Validator<unknown, Party>
  })

  static patchedPartyAction = defineAction({
    type: 'ee.client.Party.PATCHED_PARTY' as const,
    party: matches.object as Validator<unknown, Party>
  })

  static removedPartyAction = defineAction({
    type: 'ee.client.Party.REMOVED_PARTY' as const,
    party: matches.object as Validator<unknown, Party>
  })

  static invitedPartyUserAction = defineAction({
    type: 'ee.client.Party.INVITED_PARTY_USER' as const
  })

  static leftPartyAction = defineAction({
    type: 'ee.client.Party.LEFT_PARTY' as const
  })

  static createdPartyUserAction = defineAction({
    type: 'ee.client.Party.CREATED_PARTY_USER' as const,
    partyUser: matches.object as Validator<unknown, PartyUser>
  })

  static patchedPartyUserAction = defineAction({
    type: 'ee.client.Party.PATCHED_PARTY_USER' as const,
    partyUser: matches.object as Validator<unknown, PartyUser>
  })

  static removedPartyUserAction = defineAction({
    type: 'ee.client.Party.REMOVED_PARTY_USER' as const,
    partyUser: matches.object as Validator<unknown, PartyUser>
  })

  static changedPartyAction = defineAction({
    type: 'ee.client.Party.CHANGED_PARTY' as const
  })

  static resetUpdateNeededAction = defineAction({
    type: 'ee.client.Party.RESET_UPDATE_NEEDED' as const
  })
}

const loadedPartyQueue = defineActionQueue(PartyActions.loadedPartyAction.matches)
const createdPartyQueue = defineActionQueue(PartyActions.createdPartyAction.matches)
const removedPartyQueue = defineActionQueue(PartyActions.removedPartyAction.matches)
const invitedPartyUserQueue = defineActionQueue(PartyActions.invitedPartyUserAction.matches)
const createdPartyUserQueue = defineActionQueue(PartyActions.createdPartyUserAction.matches)
const patchedPartyUserQueue = defineActionQueue(PartyActions.patchedPartyUserAction.matches)
const removedPartyUserQueue = defineActionQueue(PartyActions.removedPartyUserAction.matches)
const changedPartyActionQueue = defineActionQueue(PartyActions.changedPartyAction.matches)
const resetUpdateNeededActionQueue = defineActionQueue(PartyActions.resetUpdateNeededAction.matches)

const execute = () => {
  for (const action of loadedPartyQueue()) PartyServiceReceptors.loadedPartyReceptor(action)
  for (const action of createdPartyQueue()) PartyServiceReceptors.createdPartyReceptor(action)
  for (const action of removedPartyQueue()) PartyServiceReceptors.removedPartyReceptor(action)
  for (const action of invitedPartyUserQueue()) PartyServiceReceptors.invitedPartyUserReceptor(action)
  for (const action of createdPartyUserQueue()) PartyServiceReceptors.createdPartyUserReceptor(action)
  for (const action of patchedPartyUserQueue()) PartyServiceReceptors.patchedPartyUserReceptor(action)
  for (const action of removedPartyUserQueue()) PartyServiceReceptors.removedPartyUserReceptor(action)
  for (const action of changedPartyActionQueue()) PartyServiceReceptors.changedPartyReceptor(action)
  for (const action of resetUpdateNeededActionQueue()) PartyServiceReceptors.resetUpdateNeededReceptor(action)
}

export const PartyServiceReceptorSystem = defineSystem({
  uuid: 'ee.client.PartyServiceReceptorSystem',
  execute
})

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

export const PartySystem = defineSystem({
  uuid: 'ee.client.PartySystem',
  execute
})
