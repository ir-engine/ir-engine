/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { AlertService } from '../../common/state/AlertService'
import { useDispatch } from '../../store'
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
