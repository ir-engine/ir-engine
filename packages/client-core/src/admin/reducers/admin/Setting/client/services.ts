import { Dispatch } from 'redux'
import { fetchedClient } from './actions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export function fetchedClientSettings(inDec?: 'increment' | 'decrement') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const clientSettings = await client.service('client-setting').find()
      dispatch(fetchedClient(clientSettings))
    } catch (error) {
      console.error(error.message)
      AlertService.dispatchAlertError(dispatch, error.message)
    }
  }
}
