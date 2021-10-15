// TODO: Reenable me! But decoupled so we don't need to import this lib
// import { endVideoChat } from '@xrengine/client-networking/src/transports/SocketWebRTCClientFunctions';
import { Dispatch } from 'redux'
import { client } from '../../../feathers'
// TODO: Reenable me! But decoupled, maybe parties need to be in the client-networking lib
// import { provisionInstanceServer } from '@xrengine/client-networking/src/reducers/instanceConnection/service';
import { PartyAction } from './PartyActions'

import { Config } from '@xrengine/common/src/config'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import Store from '../../../store'
import { UserAction } from '../../../user/store/UserAction'
import { accessAuthState } from '../../../user/reducers/auth/AuthState'
import { ChatService } from '../chat/ChatService'
import { accessPartyState } from './PartyState'
const store = Store.store

export const PartyService = {
  getParty: () => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        // console.log('CALLING GETPARTY()');
        const partyResult = await client.service('party').get(null)
        dispatch(PartyAction.loadedParty(partyResult))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  // Temporary Method for arbitrary testing
  getParties: async (): Promise<void> => {
    let socketId: any
    const parties = await client.service('party').find()
    console.log('PARTIES', parties)
    const userId = accessAuthState().user.id.value
    console.log('USERID: ', userId)
    if ((client as any).io && socketId === undefined) {
      ;(client as any).io.emit('request-user-id', ({ id }: { id: number }) => {
        console.log('Socket-ID received: ', id)
        socketId = id
      })
      ;(client as any).io.on('message-party', (data: any) => {
        console.warn('Message received, data: ', data)
      })
      ;(window as any).joinParty = (userId: number, partyId: number) => {
        ;(client as any).io.emit(
          'join-party',
          {
            userId,
            partyId
          },
          (res) => {
            console.log('Join response: ', res)
          }
        )
      }
      ;(window as any).messageParty = (userId: number, partyId: number, message: string) => {
        ;(client as any).io.emit('message-party-request', {
          userId,
          partyId,
          message
        })
      }
      ;(window as any).partyInit = (userId: number) => {
        ;(client as any).io.emit('party-init', { userId }, (response: any) => {
          response ? console.log('Init success', response) : console.log('Init failed')
        })
      }
    } else {
      console.log('Your socket id is: ', socketId)
    }
  },
  createParty: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      console.log('CREATING PARTY')
      try {
        await client.service('party').create({})
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeParty: (partyId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      console.log('CALLING FEATHERS REMOVE PARTY')
      try {
        const channelResult = await client.service('channel').find({
          query: {
            partyId: partyId
          }
        })
        if (channelResult.total > 0) {
          await client.service('channel').remove(channelResult.data[0].id)
        }
        await client.service('party').remove(partyId)
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removePartyUser: (partyUserId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('party-user').remove(partyUserId)
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  transferPartyOwner: (partyUserId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('party-user').patch(partyUserId, {
          isOwner: 1
        })
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('party-user').on('created', async (params) => {
    const selfUser = accessAuthState().user
    if (accessPartyState().party == null) {
      store.dispatch(PartyAction.createdParty(params))
    }
    store.dispatch(PartyAction.createdPartyUser(params.partyUser))
    if (params.partyUser.userId === selfUser.id.value) {
      const party = await client.service('party').get(params.partyUser.partyId)
      const dbUser = await client.service('user').get(selfUser.id.value)
      if (
        party.instanceId != null &&
        party.instanceId !== dbUser.instanceId &&
        (store.getState() as any).get('instanceConnection').get('instanceProvisioning') === false
      ) {
        const instance = await client.service('instance').get(party.instanceId)
        const updateUser = dbUser
        updateUser.partyId = party.id
        store.dispatch(PartyAction.patchedPartyUser(updateUser))
        // TODO: Reenable me!
        // await provisionInstanceServer(instance.locationId, instance.id)(store.dispatch, store.getState);
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
      store.dispatch(ChatService.clearChatTargetIfCurrent('party', { id: params.partyUser.partyId }))
      // TODO: Reenable me!
      // endVideoChat({ leftParty: true });
    }
  })

  client.service('party').on('created', (params) => {
    store.dispatch(PartyAction.createdParty(params.party))
  })

  client.service('party').on('patched', (params) => {
    store.dispatch(PartyAction.patchedParty(params.party))
    store.dispatch(ChatService.clearChatTargetIfCurrent('party', params.party))
  })

  client.service('party').on('removed', (params) => {
    store.dispatch(PartyAction.removedParty(params.party))
  })
}
