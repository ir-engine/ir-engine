import { AuthSettingAction } from './AuthSettingActions'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch } from '../../../store'

export const AuthSettingService = {
  fetchAuthSetting: async () => {
    const dispatch = useDispatch()
    {
      try {
        const authSetting = await client.service('authentication-setting').find()
        dispatch(AuthSettingAction.authSettingRetrieved(authSetting))
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  pathAuthSetting: async (data: any, id: string) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('authentication-setting').patch(id, data)
        dispatch(AuthSettingAction.authSettingPatched(result))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
