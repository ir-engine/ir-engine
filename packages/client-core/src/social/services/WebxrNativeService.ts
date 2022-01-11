/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { AlertService } from '../../common/services/AlertService'
import { useDispatch } from '../../store'
import { createState, useState } from '@hookstate/core'
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
    {
      try {
        dispatch(WebxrNativeAction.setWebXrNative())
      } catch (err) {
        AlertService.dispatchAlertError(err)
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
        AlertService.dispatchAlertError(err)
      }
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
