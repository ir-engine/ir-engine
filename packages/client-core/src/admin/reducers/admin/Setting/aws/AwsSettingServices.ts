import { Dispatch } from 'redux'
import { AwsSettingAction } from './AwsSettingActions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export const AwsSettingService = {
  fetchAwsSetting: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const awsSetting = await client.service('aws-setting').find()
        dispatch(AwsSettingAction.awsSettingRetrieved(awsSetting))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
