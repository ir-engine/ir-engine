import { store, useDispatch } from '../../store'
import { Config } from '@xrengine/common/src/config'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
const state = createState({
  type: 'none',
  message: ''
})

store.receptors.push((action: AlertActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SHOW_NOTIFICATION':
        return s.merge({ type: action.alertType, message: action.message })
      case 'HIDE_NOTIFICATION':
        return s.merge({ type: action.alertType, message: action.message })
      default:
        break
    }
  }, action.alertType)
})

export const alertState = () => state

export const useAlertState = () => useState(state) as any as typeof state

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
  dispatchAlertError: (err: Error) => {
    const dispatch = useDispatch()
    AlertService.restartTimer()
    console.error(err)
    return dispatch(AlertAction.showAlert('error', err.message))
  },
  dispatchAlertCancel: () => {
    const dispatch = useDispatch()
    AlertService.clearTimer()
    return dispatch(AlertAction.hideAlert())
  }
}
//Action
export type AlertType = 'error' | 'success' | 'warning' | 'none'

export const AlertAction = {
  showAlert: (type: AlertType, message: string) => {
    return {
      type: 'SHOW_NOTIFICATION' as const,
      alertType: type,
      message
    }
  },
  hideAlert: () => {
    return {
      type: 'HIDE_NOTIFICATION' as const,
      alertType: 'none',
      message: ''
    }
  }
}

export type AlertActionType = ReturnType<typeof AlertAction[keyof typeof AlertAction]>
