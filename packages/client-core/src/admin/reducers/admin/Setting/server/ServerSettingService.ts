import { Dispatch } from 'redux'
import { ServerSettingAction } from './ServerSettingActions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export const ServerSettingService = {
  fetchServerSettings: (inDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        const server = await client.service('server-setting').find()
        dispatch(ServerSettingAction.fetchedSeverInfo(server))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(dispatch, error.message)
      }
    }
  }
}
