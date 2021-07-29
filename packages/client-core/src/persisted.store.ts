import { Config } from './helper'

import { RESTORE } from './user/reducers/actions'

export function restoreState(): any {
  return {
    type: RESTORE
  }
}

export function getStoredAuthState() {
  if (!window) {
    return undefined
  }
  const rawState = localStorage.getItem(Config.publicRuntimeConfig.localStorageKey)
  if (!rawState) {
    return undefined
  }
  const state = JSON.parse(rawState)
  return state
}

export function saveAuthState(state: any) {
  if (state.get('auth').get('isLoggedIn'))
    localStorage.setItem(Config.publicRuntimeConfig.localStorageKey, JSON.stringify(state.get('auth')))
}
