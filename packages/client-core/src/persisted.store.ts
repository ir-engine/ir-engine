import { Config } from '@xrengine/common/src/config'

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
  if (state.isLoggedIn) localStorage.setItem(Config.publicRuntimeConfig.localStorageKey, JSON.stringify(state))
}
