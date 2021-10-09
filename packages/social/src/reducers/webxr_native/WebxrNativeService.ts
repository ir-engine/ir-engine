/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { WebxrNativeAction } from './WebxrNativeActions'

export const WebxrNativeService = {
  getWebXrNative: () => {
    console.log('getWebXrNative Service')
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(WebxrNativeAction.setWebXrNative())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  changeWebXrNative: () => {
    console.log('changeWebXrNative Service')
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(WebxrNativeAction.tougleWebXrNative())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
