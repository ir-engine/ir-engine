import { createState } from '@hookstate/core'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import {
  addActionReceptor,
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  useState
} from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

//State
const WebxrState = defineState({
  name: 'WebxrState',
  initial: () => ({
    webxrnative: false
  })
})

export const WebxrNativeServiceReceptor = (action) => {
  const s = getMutableState(WebxrState)
  matches(action)
    .when(WebxrNativeAction.setWebXrNative.matches, () => {
      return s.webxrnative.set(false)
    })
    .when(WebxrNativeAction.toggleWebXrNative.matches, () => {
      return s.webxrnative.set(!s.webxrnative.value)
    })
}
/**@deprecated use getMutableState directly instead */
export const accessWebxrNativeState = () => getMutableState(WebxrState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useWebxrNativeState = () => useState(accessWebxrNativeState())

//Service
export const WebxrNativeService = {
  getWebXrNative: () => {
    try {
      dispatchAction(WebxrNativeAction.setWebXrNative({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  changeWebXrNative: () => {
    try {
      dispatchAction(WebxrNativeAction.toggleWebXrNative({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
//Action

export class WebxrNativeAction {
  static setWebXrNative = defineAction({
    type: 'ee.client.WebxrNative.SET_WEBXRNATIVE' as const
  })
  static toggleWebXrNative = defineAction({
    type: 'ee.client.WebxrNative.TOGGLE_WEBXRNATIVE' as const
  })
}
