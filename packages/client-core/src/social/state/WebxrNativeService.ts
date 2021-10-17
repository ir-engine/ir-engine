/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { store, useDispatch } from '../../store'
import { AlertService } from '@xrengine/client-core/src/common/state/AlertService'
import { WebxrNativeAction } from './WebxrNativeActions'

export const WebxrNativeService = {
  getWebXrNative: () => {
    console.log('getWebXrNative Service')
    const dispatch = useDispatch()
    {
      try {
        dispatch(WebxrNativeAction.setWebXrNative())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  changeWebXrNative: () => {
    console.log('changeWebXrNative Service')
    const dispatch = useDispatch()
    {
      try {
        dispatch(WebxrNativeAction.tougleWebXrNative())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
