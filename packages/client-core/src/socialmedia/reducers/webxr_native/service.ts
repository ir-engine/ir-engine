/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux'
import { dispatchAlertError } from '../../../common/reducers/alert/service'
// import { client } from '../../../feathers';
// import Api from '../../../world/components/editor/Api';
import { tougleWebXrNative, setWebXrNative } from './actions'

export function getWebXrNative() {
  console.log('getWebXrNative Service')
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(setWebXrNative())
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
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
      dispatchAlertError(dispatch, err.message)
    }
  }
}
