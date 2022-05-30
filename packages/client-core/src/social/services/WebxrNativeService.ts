/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { createState, useState } from '@speigg/hookstate'

import { NotificationService } from '../../common/services/NotificationService'
import { useDispatch } from '../../store'
import { store } from '../../store'

//State
const state = createState({
  webxrnative: false
})

store.receptors.push((action: WebxrNativeActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_WEBXRNATIVE':
        return s.webxrnative.set(false)
      case 'TOGGLE_WEBXRNATIVE':
        return s.webxrnative.set(!s.webxrnative.value)
    }
  }, action.type)
})

export const accessWebxrNativeState = () => state
export const useWebxrNativeState = () => useState(state)

//Service
export const WebxrNativeService = {
  getWebXrNative: () => {
    console.log('getWebXrNative Service')
    const dispatch = useDispatch()

    try {
      dispatch(WebxrNativeAction.setWebXrNative())
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  changeWebXrNative: () => {
    console.log('changeWebXrNative Service')
    const dispatch = useDispatch()

    try {
      dispatch(WebxrNativeAction.tougleWebXrNative())
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
//Action

export const WebxrNativeAction = {
  setWebXrNative: () => {
    return {
      type: 'SET_WEBXRNATIVE' as const
    }
  },
  tougleWebXrNative: () => {
    return {
      type: 'TOGGLE_WEBXRNATIVE' as const
    }
  }
}

export type WebxrNativeActionType = ReturnType<typeof WebxrNativeAction[keyof typeof WebxrNativeAction]>
