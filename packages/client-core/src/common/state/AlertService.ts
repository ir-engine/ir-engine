import { store, useDispatch } from '../../store'
import { AlertAction } from './AlertActions'
import { Config } from '@standardcreative/common/src/config'

let timerId: any

export const AlertService = {
  alertSuccess: async (message: string) => {
    const dispatch = useDispatch()
    {
      dispatch(AlertAction.showAlert('success', message))
    }
  },
  alertWarning: async (message: string) => {
    const dispatch = useDispatch()
    {
      dispatch(AlertAction.showAlert('warning', message))
    }
  },
  alertError: async (message: string) => {
    const dispatch = useDispatch()
    {
      dispatch(AlertAction.showAlert('error', message))
    }
  },
  alertCancel: () => {
    useDispatch()(AlertAction.hideAlert())
  },
  clearTimer: () => {
    if (timerId) {
      clearTimeout(timerId)
      timerId = 0
    }
  },
  restartTimer: () => {
    const dispatch = useDispatch()
    AlertService.clearTimer()
    timerId = setTimeout(() => dispatch(AlertAction.hideAlert()), Config.publicRuntimeConfig?.alert?.timeout || 10000)
  },
  dispatchAlertSuccess: (message: string) => {
    const dispatch = useDispatch()
    AlertService.restartTimer()
    return dispatch(AlertAction.showAlert('success', message))
  },
  dispatchAlertWarning: (message: string) => {
    const dispatch = useDispatch()
    AlertService.restartTimer()
    return dispatch(AlertAction.showAlert('warning', message))
  },
  dispatchAlertError: (message: string) => {
    const dispatch = useDispatch()
    AlertService.restartTimer()
    return dispatch(AlertAction.showAlert('error', message))
  },
  dispatchAlertCancel: () => {
    const dispatch = useDispatch()
    AlertService.clearTimer()
    return dispatch(AlertAction.hideAlert())
  }
}
