import getConfig from 'next/config'

import { RESTORE } from './actions'

const { publicRuntimeConfig } = getConfig()
const localStorageKey: string = publicRuntimeConfig.localStorageKey

export const restoreState = (): any => {
  return {
    type: RESTORE
  }
}

export const getStoredState = (key: string) => {
  if (!window) {
    return undefined
  }
  const rawState = localStorage.getItem(localStorageKey)
  if (!rawState) {
    return undefined
  }
  const state = JSON.parse(rawState)
  return state[key]
}

export const saveState = (state: any) =>
  localStorage.setItem(localStorageKey, JSON.stringify(state))
