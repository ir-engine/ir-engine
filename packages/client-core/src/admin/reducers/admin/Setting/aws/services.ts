import { Dispatch } from 'redux'
import { awsSettingRetrieved } from './actions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export function fetchAwsSetting() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const awsSetting = await client.service('aws-setting').find()
      dispatch(awsSettingRetrieved(awsSetting))
    } catch (err) {
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
