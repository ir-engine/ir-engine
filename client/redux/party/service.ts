import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedParty,
  createdParty,
  patchedParty,
  removedParty,
  removedPartyUser,
  createdPartyUser,
  patchedPartyUser
} from './actions'
import {dispatchAlertError} from "../alert/service";
import store from "../store";

export function getParty() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const partyResult = await client.service('party').get(null)
      dispatch(loadedParty(partyResult))
    } catch(err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createParty(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('party').create({})
    } catch(err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeParty(partyId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const channelResult = await client.service('channel').find({
        query: {
          partyId: partyId
        }
      }) as any
      if (channelResult.total > 0) {
        await client.service('channel').remove(channelResult.data[0].id)
      }
      await client.service('party').remove(partyId)
    } catch(err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removePartyUser(partyUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('party-user').remove(partyUserId)
    } catch(err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

client.service('party-user').on('created', (params) => {
  store.dispatch(createdPartyUser(params.partyUser))
})

client.service('party-user').on('patched', (params) => {
  store.dispatch(patchedPartyUser(params.partyUser))
})

client.service('party-user').on('removed', (params) => {
  store.dispatch(removedPartyUser(params.partyUser))
})

client.service('party').on('created', (params) => {
  store.dispatch(createdParty(params.party))
})

client.service('party').on('patched', (params) => {
  store.dispatch(patchedParty(params.party))
})

client.service('party').on('removed', (params) => {
  store.dispatch(removedParty(params.party))
})