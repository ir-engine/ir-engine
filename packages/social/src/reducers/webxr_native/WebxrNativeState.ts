/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { createState, useState, none, Downgraded } from '@hookstate/core'
import { WebxrNativeActionType } from './WebxrNativeActions'

const state = createState({
  webxrnative: null
})

export const webxrnativeReducer = (_, action: WebxrNativeActionType) => {
  Promise.resolve().then(() => webxrnativeReceptor(action))
  return state.attach(Downgraded).value
}

const webxrnativeReceptor = (action: WebxrNativeActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_WEBXRNATIVE':
        return s.webxrnative.set(false)
      case 'TOGGLE_WEBXRNATIVE':
        return s.webxrnative.set(!s.webxrnative.value)
    }
  }, action.type)
}

export const accessWebxrNativeState = () => state
export const useWebxrNativeState = () => useState(state)
