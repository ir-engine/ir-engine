import { Dispatch } from 'redux'
import { EmailSettingAction } from './EmailSettingActions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export const EmailSettingService = {
  fetchedEmailSettings: (inDec?: 'increment' | 'dcrement') => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        const emailSettings = await client.service('email-setting').find()
        dispatch(EmailSettingAction.fetchedEmail(emailSettings))
      } catch (error) {
        console.log(error.message)
        AlertService.dispatchAlertError(dispatch, error.message)
      }
    }
  }
}
