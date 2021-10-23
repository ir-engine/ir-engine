/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { store } from '../../store'
import { WebxrNativeActionType } from './WebxrNativeActions'

const state = createState({
  webxrnative: null
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
