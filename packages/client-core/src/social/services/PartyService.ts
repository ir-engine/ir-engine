import { Paginated } from '@feathersjs/feathers'
// TODO: Reenable me! But decoupled so we don't need to import this lib
// import { endVideoChat } from '@xrengine/client-networking/src/transports/SocketWebRTCClientFunctions';
import { createState, useState } from '@speigg/hookstate'
import i18n from 'i18next'
import _ from 'lodash'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { Party } from '@xrengine/common/src/interfaces/Party'
import { PartyUser } from '@xrengine/common/src/interfaces/PartyUser'
import { User } from '@xrengine/common/src/interfaces/User'
import multiLogger from '@xrengine/common/src/logger'

import { AlertService } from '../../common/services/AlertService'
import { accessLocationInstanceConnectionState } from '../../common/services/LocationInstanceConnectionService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { accessAuthState } from '../../user/services/AuthService'
import { UserAction } from '../../user/services/UserService'
import { ChatService } from './ChatService'

const logger = multiLogger.child({ component: 'client-core:social' })

// State
const state = createState({
  party: {} as Party,
  updateNeeded: true
})

store.receptors.push((action: PartyActionType): any => {
  let newValues, updateMap, partyUser, updateMapPartyUsers

  state.batch((s) => {
    switch (action.type) {
      case 'LOADED_PARTY':
        return s.merge({ party: action.party, updateNeeded: false })
      case 'CREATED_PARTY':
        return s.updateNeeded.set(true)
      case 'REMOVED_PARTY':
        updateMap = new Map()
        return s.merge({ party: {}, updateNeeded: true })
      case 'INVITED_PARTY_USER':
        return s.updateNeeded.set(true)
      case 'CREATED_PARTY_USER':
        newValues = action
        partyUser = newValues.partyUser
        updateMap = _.cloneDeep(s.party.value)
        if (updateMap != null) {
          updateMapPartyUsers = updateMap.partyUsers
          updateMapPartyUsers = Array.isArray(updateMapPartyUsers)
            ? updateMapPartyUsers.find((pUser) => {
                return pUser != null && pUser.id === partyUser.id
              }) == null
              ? updateMapPartyUsers.concat([partyUser])
              : updateMap.partyUsers.map((pUser) => {
                  return pUser != null && pUser.id === partyUser.id ? partyUser : pUser
                })
            : [partyUser]
          updateMap.partyUsers = updateMapPartyUsers
        }
        return s.merge({ party: updateMap, updateNeeded: true })

      case 'PATCHED_PARTY_USER':
        newValues = action
        partyUser = newValues.partyUser
        logger.info({ partyUser }, 'Patched partyUser.')
        updateMap = _.cloneDeep(s.party.value)
        if (updateMap != null) {
          updateMapPartyUsers = updateMap.partyUsers
          updateMapPartyUsers = Array.isArray(updateMapPartyUsers)
            ? updateMapPartyUsers.find((pUser) => {
                return pUser != null && pUser.id === partyUser.id
              }) == null
              ? updateMapPartyUsers.concat([partyUser])
              : updateMap.partyUsers.map((pUser) => {
                  return pUser != null && pUser.id === partyUser.id ? partyUser : pUser
                })
            : [partyUser]
          updateMap.partyUsers = updateMapPartyUsers
        }
        return s.party.set(updateMap)

      case 'REMOVED_PARTY_USER':
        newValues = action
        partyUser = newValues.partyUser
        updateMap = _.cloneDeep(s.party.value)
        if (updateMap != null) {
          updateMapPartyUsers = updateMap.partyUsers
          _.remove(updateMapPartyUsers, (pUser: PartyUser) => {
            return pUser != null && partyUser.id === pUser.id
          })
        }
        s.party.set(updateMap)
        return s.updateNeeded.set(true)
    }
  }, action.type)
})

export const accessPartyState = () => state

export const usePartyState = () => useState(state) as any as typeof state

//Service
export const PartyService = {
  getParty: async () => {
    const dispatch = useDispatch()
    try {
      // console.log('CALLING GETPARTY()');
      const partyResult = (await client.service('party').get('')) as Party
      dispatch(PartyAction.loadedParty(partyResult))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  // Temporary Method for arbitrary testing
  getParties: async (): Promise<void> => {
    let socketId: any
    const parties = await client.service('party').find()
    const userId = accessAuthState().user.id.value
    if (client.io && socketId === undefined) {
      client.io.emit('request-user-id', ({ id }: { id: number }) => {
        logger.info('Socket-ID received: ' + id)
        socketId = id
      })
      client.io.on('message-party', (data: any) => {
        logger.info({ data }, 'Message received.')
      })
      ;(window as any).joinParty = (userId: number, partyId: number) => {
        client.io.emit(
          'join-party',
          {
            userId,
            partyId
          },
          (res) => {
            logger.info({ res }, 'Join response.')
          }
        )
      }
      ;(window as any).messageParty = (userId: number, partyId: number, message: string) => {
        client.io.emit('message-party-request', {
          userId,
          partyId,
          message
        })
      }
      ;(window as any).partyInit = (userId: number) => {
        client.io.emit('party-init', { userId }, (response: any) => {
          response ? logger.info({ response }, 'Init success.') : logger.info('Init failed.')
        })
      }
    } else {
      logger.info('Your socket id is: ' + socketId)
    }
  },
  createParty: async () => {
    logger.info('CREATING PARTY')
    try {
      await client.service('party').create({})
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  removeParty: async (partyId: string) => {
    const dispatch = useDispatch()

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
      dispatch(PartyAction.removedParty(party))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  inviteToParty: async (partyId: string, userId: string) => {
    try {
      const result = await client.service('party-user').create({
        partyId,
        userId
      })
      AlertService.dispatchAlertSuccess(i18n.t('social:partyInvitationSent'))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  removePartyUser: async (partyUserId: string) => {
    try {
      await client.service('party-user').remove(partyUserId)
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  transferPartyOwner: async (partyUserId: string) => {
    try {
      await client.service('party-user').patch(partyUserId, {
        isOwner: true
      })
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  }
}

if (globalThis.process.env['VITE_OFFLINE_MODE'] !== 'true') {
  client.service('party-user').on('created', async (params) => {
    const selfUser = accessAuthState().user
    if (accessPartyState().party == null) {
      store.dispatch(PartyAction.createdParty(params))
    }
    store.dispatch(PartyAction.createdPartyUser(params.partyUser))
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
        store.dispatch(PartyAction.patchedPartyUser(updateUser))
        // TODO: Reenable me!
        // await provisionServer(instance.locationId, instance.id)(store.dispatch, store.getState);
      }
    }
  })

  client.service('party-user').on('patched', (params) => {
    const updatedPartyUser = params.partyUser
    const selfUser = accessAuthState().user
    store.dispatch(PartyAction.patchedPartyUser(updatedPartyUser))
    if (
      updatedPartyUser.user.channelInstanceId != null &&
      updatedPartyUser.user.channelInstanceId === selfUser.channelInstanceId.value
    )
      store.dispatch(UserAction.addedChannelLayerUser(updatedPartyUser.user))
    if (updatedPartyUser.user.channelInstanceId !== selfUser.channelInstanceId.value)
      store.dispatch(UserAction.removedChannelLayerUser(updatedPartyUser.user))
  })

  client.service('party-user').on('removed', (params) => {
    const deletedPartyUser = params.partyUser
    const selfUser = accessAuthState().user
    store.dispatch(PartyAction.removedPartyUser(deletedPartyUser))
    store.dispatch(UserAction.removedChannelLayerUser(deletedPartyUser.user))
    if (params.partyUser.userId === selfUser.id) {
      ChatService.clearChatTargetIfCurrent('party', { id: params.partyUser.partyId })
      // TODO: Reenable me!
      // endVideoChat({ leftParty: true });
    }
  })

  client.service('party').on('created', (params) => {
    store.dispatch(PartyAction.createdParty(params.party))
  })

  client.service('party').on('patched', (params) => {
    store.dispatch(PartyAction.patchedParty(params.party))
    ChatService.clearChatTargetIfCurrent('party', params.party)
  })

  client.service('party').on('removed', (params) => {
    store.dispatch(PartyAction.removedParty(params.party))
  })
}

//Action

export const PartyAction = {
  loadedParty: (partyResult: Party) => {
    return {
      type: 'LOADED_PARTY' as const,
      party: partyResult
    }
  },
  createdParty: (party: Party) => {
    return {
      type: 'CREATED_PARTY' as const,
      party: party
    }
  },
  patchedParty: (party: Party) => {
    return {
      type: 'PATCHED_PARTY' as const,
      party: party
    }
  },
  removedParty: (party: Party) => {
    return {
      type: 'REMOVED_PARTY' as const,
      party: party
    }
  },
  invitedPartyUser: () => {
    return {
      type: 'INVITED_PARTY_USER' as const
    }
  },
  leftParty: () => {
    return {
      type: 'LEFT_PARTY' as const
    }
  },
  createdPartyUser: (partyUser: PartyUser) => {
    return {
      type: 'CREATED_PARTY_USER' as const,
      partyUser: partyUser
    }
  },
  patchedPartyUser: (partyUser: PartyUser) => {
    return {
      type: 'PATCHED_PARTY_USER' as const,
      partyUser: partyUser
    }
  },
  removedPartyUser: (partyUser: PartyUser) => {
    return {
      type: 'REMOVED_PARTY_USER' as const,
      partyUser: partyUser
    }
  }
}

export type PartyActionType = ReturnType<typeof PartyAction[keyof typeof PartyAction]>
