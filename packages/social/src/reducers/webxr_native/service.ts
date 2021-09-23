/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { tougleWebXrNative, setWebXrNative } from './actions'

export function getWebXrNative() {
  console.log('getWebXrNative Service')
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(setWebXrNative())
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function changeWebXrNative() {
  console.log('changeWebXrNative Service')
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(tougleWebXrNative())
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
