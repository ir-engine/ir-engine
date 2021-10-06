import { Dispatch } from 'redux'
import { ChargebeeSettingAction } from './ChargebeeSettingActions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export const ChargebeeSettingService = {
  fetchChargeBee: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const chargeBee = await client.service('chargebee-setting').find()
        dispatch(ChargebeeSettingAction.fetchedChargebee(chargeBee))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
