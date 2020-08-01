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
      console.log('GOT PARTY')
      console.log(partyResult)
      dispatch(loadedParty(partyResult))
    } catch(err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createParty(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    console.log('CREATING PARTY')
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
    console.log('CALLING FEATHERS REMOVE PARTY')
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
  console.log('PARTY-USER CREATED EVENT')
  console.log(params)
  store.dispatch(createdPartyUser(params.partyUser))
})

client.service('party-user').on('patched', (params) => {
  console.log('PARTY-USER PATCHED EVENT')
  console.log(params)
  store.dispatch(patchedPartyUser(params.partyUser))
})

client.service('party-user').on('removed', (params) => {
  console.log('PARTY-USER REMOVED EVENT')
  console.log(params)
  store.dispatch(removedPartyUser(params.partyUser))
})

client.service('party').on('created', (params) => {
  console.log('PARTY CREATED EVENT')
  console.log(params)
  store.dispatch(createdParty(params.party))
})

client.service('party').on('patched', (params) => {
  console.log('PARTY PATCHED EVENT')
  console.log(params)
  store.dispatch(patchedParty(params.party))
})

client.service('party').on('removed', (params) => {
  console.log('PARTY REMOVED EVENT')
  console.log(params)
  store.dispatch(removedParty(params.party))
})