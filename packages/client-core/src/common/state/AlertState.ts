import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { store } from '../../store'

import { AlertActionType } from './AlertActions'

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
