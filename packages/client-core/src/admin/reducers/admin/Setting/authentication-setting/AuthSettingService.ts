import { Dispatch } from 'redux'
import { AuthSettingAction } from './AuthSettingActions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export const AuthSettingService = {
  fetchAuthSetting: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const authSetting = await client.service('authentication-setting').find()
        dispatch(AuthSettingAction.authSettingRetrieved(authSetting))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  pathAuthSetting: (data: any, id: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('authentication-setting').patch(id, data)
        dispatch(AuthSettingAction.authSettingPatched(result))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
