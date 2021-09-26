import { Dispatch } from 'redux'
import { AlertAction } from './AlertActions'
import { Config } from '@xrengine/common/src/config'

let timerId: any

export const AlertService = {
  alertSuccess: (message: string) => {
    return (dispatch: Dispatch): any => {
      dispatch(AlertAction.showAlert('success', message))
    }
  },
  alertWarning: (message: string) => {
    return (dispatch: Dispatch): any => {
      dispatch(AlertAction.showAlert('warning', message))
    }
  },
  alertError: (message: string) => {
    return (dispatch: Dispatch): any => {
      dispatch(AlertAction.showAlert('error', message))
    }
  },
  alertCancel: () => {
    return (dispatch: Dispatch): any => {
      dispatch(AlertAction.hideAlert())
    }
  },
  clearTimer: () => {
    if (timerId) {
      clearTimeout(timerId)
      timerId = 0
    }
  },
  restartTimer: (dispatch: Dispatch) => {
    AlertService.clearTimer()
    timerId = setTimeout(() => dispatch(AlertAction.hideAlert()), Config.publicRuntimeConfig?.alert?.timeout || 10000)
  },
  dispatchAlertSuccess: (dispatch: Dispatch, message: string) => {
    AlertService.restartTimer(dispatch)
    return dispatch(AlertAction.showAlert('success', message))
  },
  dispatchAlertWarning: (dispatch: Dispatch, message: string) => {
    AlertService.restartTimer(dispatch)
    return dispatch(AlertAction.showAlert('warning', message))
  },
  dispatchAlertError: (dispatch: Dispatch, message: string) => {
    AlertService.restartTimer(dispatch)
    return dispatch(AlertAction.showAlert('error', message))
  },
  dispatchAlertCancel: (dispatch: Dispatch) => {
    AlertService.clearTimer()
    return dispatch(AlertAction.hideAlert())
  }
}
