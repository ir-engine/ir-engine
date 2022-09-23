import { createState } from '@hookstate/core'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { addActionReceptor, defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

//State
const WebxrState = defineState({
  name: 'WebxrState',
  initial: () => ({
    webxrnative: false
  })
})

export const WebxrNativeServiceReceptor = (action) => {
  const s = getState(WebxrState)
  matches(action)
    .when(WebxrNativeAction.setWebXrNative.matches, () => {
      return s.webxrnative.set(false)
    })
    .when(WebxrNativeAction.toggleWebXrNative.matches, () => {
      return s.webxrnative.set(!s.webxrnative.value)
    })
}

export const accessWebxrNativeState = () => getState(WebxrState)
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
    type: 'xre.client.WebxrNative.SET_WEBXRNATIVE' as const
  })
  static toggleWebXrNative = defineAction({
    type: 'xre.client.WebxrNative.TOGGLE_WEBXRNATIVE' as const
  })
}
