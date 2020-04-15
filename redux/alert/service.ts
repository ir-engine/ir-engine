import { Dispatch } from "redux"
import {
  showAlert,
  hideAlert
} from "./actions"

export function alertSuccess(message: string) {
  return (dispatch: Dispatch) => {
    dispatch(showAlert('success', message))
  }
}
export function alertWarning(message: string) {
  return (dispatch: Dispatch) => {
    dispatch(showAlert('warning', message))
  }
}
export function alertError(message: string) {
  return (dispatch: Dispatch) => {
    dispatch(showAlert('error', message))
  }
}
export function alertCancel() {
  return (dispatch: Dispatch) => {
    dispatch(hideAlert())
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
  timerId = setTimeout(() => dispatch(hideAlert()), 5000)
}

export function dispatchAlertSuccess(dispatch: Dispatch, message: string) {
  restartTimer(dispatch)

  return dispatch(showAlert('success', message))
}
export function dispatchAlertWarning(dispatch: Dispatch, message: string) {
  restartTimer(dispatch)

  return dispatch(showAlert('warning', message))
}
export function dispatchAlertError(dispatch: Dispatch, message: string) {
  restartTimer(dispatch)

  return dispatch(showAlert('error', message))
}
export function dispatchAlertCancel(dispatch: Dispatch) {
  clearTimer()

  return dispatch(hideAlert())
}
