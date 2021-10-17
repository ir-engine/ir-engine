import { EmailSettingAction } from './EmailSettingActions'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch } from '../../../store'

export const EmailSettingService = {
  fetchedEmailSettings: async (inDec?: 'increment' | 'dcrement') => {
    const dispatch = useDispatch()
    try {
      const emailSettings = await client.service('email-setting').find()
      dispatch(EmailSettingAction.fetchedEmail(emailSettings))
    } catch (error) {
      console.log(error.message)
      AlertService.dispatchAlertError(error.message)
    }
  }
}
