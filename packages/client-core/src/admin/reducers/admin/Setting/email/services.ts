import { Dispatch } from 'redux'
import { fetchedEmail } from './actions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export function fetchedEmailSettings(inDec?: 'increment' | 'dcrement') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const emailSettings = await client.service('email-setting').find()
      dispatch(fetchedEmail(emailSettings))
    } catch (error) {
      console.log(error.message)
      AlertService.dispatchAlertError(dispatch, error.message)
    }
  }
}
