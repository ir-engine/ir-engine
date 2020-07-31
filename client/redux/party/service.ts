import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedParty,
  addedParty,
  removedParty,
  removedPartyUser
} from './actions'
import {dispatchAlertError} from "../alert/service";

export function getParty() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const partyResult = await client.service('party').get(null)
      console.log('GOT PARTY')
      console.log(partyResult)
      dispatch(loadedParty(partyResult))
    } catch(err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createParty(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    console.log('CREATING PARTY')
    try {
      await client.service('party').create({})
      console.log('CREATED PARTY')
      dispatch(addedParty())
    } catch(err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeParty(partyId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    console.log('CALLING FEATHERS REMOVE PARTY')
    try {
      await client.service('party').remove(partyId)
      console.log('FINISHED FEATHERS REMOVE PARTY')
      dispatch(removedParty())
    } catch(err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removePartyUser(partyUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('party-user').remove(partyUserId)
      dispatch(removedPartyUser())
    } catch(err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function forcePartyUserRefresh() {
  return async (dispatch: Dispatch): Promise<any> => {
    dispatch(removedPartyUser())
  }
}