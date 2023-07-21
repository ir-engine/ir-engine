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
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'

import {
  MediaInstanceConnectionService,
  MediaInstanceState
} from '../../common/services/MediaInstanceConnectionService'
import { NotificationService } from '../../common/services/NotificationService'
import { SocketWebRTCClientNetwork, endVideoChat, leaveNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { AuthState } from '../../user/services/AuthService'
import { ChannelState } from './ChannelService'
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

//Service
export const PartyService = {
  getParty: async () => {
    try {
      const partyResult = (await Engine.instance.api.service('party').get('')) as Party
      if (partyResult) {
        partyResult.partyUsers = partyResult.party_users

        const state = getMutableState(PartyState)
        state.merge({
          party: partyResult,
          isOwned:
            getState(AuthState).user.id ===
            (partyResult.partyUsers && partyResult.partyUsers.find((user) => user.isOwner)?.userId),
          updateNeeded: false
        })
      } else {
        const state = getMutableState(PartyState)
        return state.updateNeeded.set(false)
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
      await Engine.instance.api.service('channel').create({})
      PartyService.getParty()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeParty: async (partyId: string) => {
    try {
      const channelResult = (await Engine.instance.api.service('channel').find({
        query: {
          partyId: partyId
        }
      })) as Paginated<Channel>
      if (channelResult.total > 0) {
        await Engine.instance.api.service('channel').remove(channelResult.data[0].id)
      }
      // const party = (await Engine.instance.api.service('party').remove(partyId)) as Party
      const state = getMutableState(PartyState)
      return state.merge({ party: null!, updateNeeded: true })
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
      const channels = getState(ChannelState).channels.channels
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
          const state = getMutableState(PartyState)
          return state.updateNeeded.set(true)
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
          const state = getMutableState(PartyState)
          if (state.party && state.party.partyUsers && state.party.partyUsers.value) {
            const users = JSON.parse(JSON.stringify(state.party.partyUsers.value)) as PartyUser[]
            const index = users.findIndex((partyUser) => partyUser?.id === params.partyUser.id)

            if (index > -1) users[index] = params.partyUser
            else users.push(params.partyUser)

            return state.party.merge({ partyUsers: users })
          }
          state.updateNeeded.set(true)
        } else {
          NotificationService.dispatchNotify(t('social:selfJoinedParty'), { variant: 'success' })
          const state = getMutableState(PartyState)
          return state.updateNeeded.set(true)
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
        //     partyUserPatchedListener({ partyUser: updateUser })
        //     await MediaInstanceConnectionService.provisionServer(party.instanceId, false)
        //   }
        // }
      }

      const partyUserPatchedListener = (params) => {
        const state = getMutableState(PartyState)
        if (state.party && state.party.partyUsers && state.party.partyUsers.value) {
          const users = JSON.parse(JSON.stringify(state.party.partyUsers.value)) as PartyUser[]
          const index = users.findIndex((partyUser) => partyUser?.id === params.id)
          const isOwned = getMutableState(AuthState).user.id.value === params.userId && params.isOwner

          state.isOwned.set(isOwned)
          if (index > -1) {
            users[index] = params
            return state.party.merge({ partyUsers: users })
          }
        }
        state.updateNeeded.set(true)
      }

      const partyUserRemovedListener = async (params) => {
        const selfUser = getState(AuthState).user
        const state = getMutableState(PartyState)

        if (params.userId === getMutableState(AuthState).user.id.value) state.merge({ party: null!, isOwned: false })

        if (state.party && state.party.partyUsers && state.party.partyUsers.value) {
          const index = state.party.partyUsers
            .get({ noproxy: true })
            ?.findIndex((partyUser) => partyUser?.id === params.id)
          if (index && index > -1) {
            const users = JSON.parse(JSON.stringify(state.party.partyUsers.value))
            users.splice(index, 1)
            return state.party.partyUsers.set(users)
          }
        }

        if (params.userId === selfUser.id) {
          const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
          if (params.instance?.id === network?.hostId) {
            NotificationService.dispatchNotify(t('social:selfLeftParty'), { variant: 'warning' })
            await PartyService.leaveNetwork(true)
          }
          // ChannelState.clearChatTargetIfCurrent('party', {
          //   id: params.partyId
          // })
        } else {
          const username = params.user ? params.user.name : 'A party user'
          NotificationService.dispatchNotify(username + t('social:otherLeftParty'), { variant: 'warning' })
        }
      }

      const partyCreatedListener = (party: Party) => {
        party.partyUsers = party.party_users
        const state = getMutableState(PartyState)
        state.merge({ party, updateNeeded: true })
      }

      const partyPatchedListener = (party: Party) => {
        party.partyUsers = party.party_users
        // dispatchAction(PartyActions.patchedPartyAction({ party }))
        // ChannelState.clearChatTargetIfCurrent('party', party)
      }

      const partyRemovedListener = (party: Party) => {
        party.partyUsers = party.party_users
        const state = getMutableState(PartyState)
        return state.merge({ party: null!, updateNeeded: true })
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
