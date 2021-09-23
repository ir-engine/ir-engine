import { Dispatch } from 'redux'
import { AlertAction } from './AlertActions'
import { Config } from '@xrengine/common/src/config'

export function alertSuccess(message: string) {
  return (dispatch: Dispatch): any => {
    dispatch(AlertAction.showAlert('success', message))
  }
}
export function alertWarning(message: string) {
  return (dispatch: Dispatch): any => {
    dispatch(AlertAction.showAlert('warning', message))
  }
}
export function alertError(message: string) {
  return (dispatch: Dispatch): any => {
    dispatch(AlertAction.showAlert('error', message))
  }
}
export function alertCancel() {
  return (dispatch: Dispatch): any => {
    dispatch(AlertAction.hideAlert())
  }
}

let timerId: any
function clearTimer() {
  if (timerId) {
    clearTimeout(timerId)
    timerId = 0
  }
}

function restartTimer(dispatch: Dispatch) {
  clearTimer()
  timerId = setTimeout(() => dispatch(AlertAction.hideAlert()), Config.publicRuntimeConfig?.alert?.timeout || 10000)
}

export function dispatchAlertSuccess(dispatch: Dispatch, message: string) {
  restartTimer(dispatch)
  return dispatch(AlertAction.showAlert('success', message))
}
export function dispatchAlertWarning(dispatch: Dispatch, message: string) {
  restartTimer(dispatch)
  return dispatch(AlertAction.showAlert('warning', message))
}
export function dispatchAlertError(dispatch: Dispatch, message: string) {
  restartTimer(dispatch)
  return dispatch(AlertAction.showAlert('error', message))
}
export function dispatchAlertCancel(dispatch: Dispatch) {
  clearTimer()
  return dispatch(AlertAction.hideAlert())
}
