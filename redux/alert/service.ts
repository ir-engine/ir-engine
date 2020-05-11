import { Dispatch } from 'redux'
import {
  showAlert,
  hideAlert
} from './actions'
import getConfig from 'next/config'

const config = getConfig().publicRuntimeConfig
const timeout = (config && config.alert && config.alert.timeout) ?? 10000

export const alertSuccess = (message: string) => {
  return (dispatch: Dispatch) => {
    dispatch(showAlert('success', message))
  }
}
export const alertWarning = (message: string) => {
  return (dispatch: Dispatch) => {
    dispatch(showAlert('warning', message))
  }
}
export const alertError = (message: string) => {
  return (dispatch: Dispatch) => {
    dispatch(showAlert('error', message))
  }
}
export const alertCancel = () => {
  return (dispatch: Dispatch) => {
    dispatch(hideAlert())
  }
}

let timerId: any
const clearTimer = () => {
  if (timerId) {
    clearTimeout(timerId)
    timerId = 0
  }
}

const restartTimer = (dispatch: Dispatch) => {
  clearTimer()
  timerId = setTimeout(() => dispatch(hideAlert()), timeout)
}

export const dispatchAlertSuccess = (dispatch: Dispatch, message: string) => {
  restartTimer(dispatch)

  return dispatch(showAlert('success', message))
}
export const dispatchAlertWarning = (dispatch: Dispatch, message: string) => {
  restartTimer(dispatch)

  return dispatch(showAlert('warning', message))
}
export const dispatchAlertError = (dispatch: Dispatch, message: string) => {
  restartTimer(dispatch)

  return dispatch(showAlert('error', message))
}
export const dispatchAlertCancel = (dispatch: Dispatch) => {
  clearTimer()

  return dispatch(hideAlert())
}
