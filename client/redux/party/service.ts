import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedParty,
  addedParty,
  removedParty,
  removedPartyUser,
  loadedPartyUsers,
  loadedSelfPartyUser,
  fetchingPartyUsers,
  fetchingSelfPartyUser
} from './actions'

export function getParty() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const partyResult = await client.service('party').get(null)
    console.log('GOT PARTY')
    console.log(partyResult)
    dispatch(loadedParty(partyResult))
  }
}

export function createParty(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    console.log('CREATING PARTY')
    await client.service('party').create({})
    console.log('CREATED PARTY')
    dispatch(addedParty())
  }
}

export function removeParty(partyId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    console.log('CALLING FEATHERS REMOVE PARTY')
    await client.service('party').remove(partyId)
    console.log('FINISHED FEATHERS REMOVE PARTY')
    dispatch(removedParty())
  }
}

export function removePartyUser(partyUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('party-user').remove(partyUserId)
    dispatch(removedPartyUser())
  }
}

export function getPartyUsers(partyId: string, skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingPartyUsers())
    const partyUserResults = await client.service('party-user').find({
      query: {
        partyId: partyId,
        $limit: limit != null ?limit : getState().get('party').get('partyUsers').get('limit'),
        $skip: skip != null ? skip : getState().get('party').get('partyUsers').get('skip'),
      }
    })
    dispatch(loadedPartyUsers(partyUserResults))
  }
}

export function getSelfPartyUser(partyId: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingSelfPartyUser())
    const selfPartyUserResults = await client.service('party-user').find({
      query: {
        partyId: partyId,
        userId: getState().get('auth').get('user').id
      }
    })
    console.log('GOT SELF PARTY USER:')
    console.log(selfPartyUserResults.data)
    dispatch(loadedSelfPartyUser(selfPartyUserResults))
  }
}

export function forcePartyUserRefresh() {
  return async (dispatch: Dispatch): Promise<any> => {
    dispatch(removedPartyUser())
  }
}