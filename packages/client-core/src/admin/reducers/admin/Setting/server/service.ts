import { Dispatch } from 'redux'
import { fetchedSeverInfo } from './actions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export function fetchServerSettings(inDec?: 'increment' | 'decrement') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const server = await client.service('server-setting').find()

      dispatch(fetchedSeverInfo(server))
    } catch (error) {
      console.error(error)
      AlertService.dispatchAlertError(dispatch, error.message)
    }
  }
}
