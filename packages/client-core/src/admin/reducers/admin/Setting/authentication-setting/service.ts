import { Dispatch } from 'redux'
import { authSettingRetrieved, authSettingPatched } from './actions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export function fetchAuthSetting() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const authSetting = await client.service('authentication-setting').find()
      dispatch(authSettingRetrieved(authSetting))
    } catch (err) {
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function pathAuthSetting(data: any, id: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('authentication-setting').patch(id, data)
      dispatch(authSettingPatched(result))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
