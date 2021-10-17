import { AwsSettingAction } from './AwsSettingActions'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch } from '../../../store'

export const AwsSettingService = {
  fetchAwsSetting: async () => {
    const dispatch = useDispatch()
    {
      try {
        const awsSetting = await client.service('aws-setting').find()
        dispatch(AwsSettingAction.awsSettingRetrieved(awsSetting))
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
