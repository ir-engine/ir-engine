import { createState, Downgraded, useState } from '@hookstate/core'
import { Config } from '@xrengine/common/src/config'
import { store } from '../store'

const state = createState({
  authData: {} as any
})

type StateTypes = Partial<typeof state.value>

export const accessStoredLocalState = () => state
export const useStoredLocalState = () => useState(state) as any as typeof state

if (typeof window !== 'undefined') {
  const rawState = localStorage.getItem(`https://${globalThis.process.env['VITE_LOCAL_STORAGE_KEY']}`)
  if (rawState) {
    const newState = JSON.parse(rawState)
    console.log(newState)
    state.merge(newState)
  }
}

store.receptors.push((action: StoredLocalActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'STORE_LOCAL':
        s.merge(action.newState)
        localStorage.setItem(
          `https://${globalThis.process.env['VITE_LOCAL_STORAGE_KEY']}`,
          JSON.stringify(s.attach(Downgraded).value)
        )
        return
    }
  })
})

export const StoredLocalAction = {
  storedLocal: (newState: StateTypes) => {
    return {
      type: 'STORE_LOCAL' as const,
      newState
    }
  },
  restoreLocalData: () => {
    return {
      type: 'RESTORE' as const
    }
  }
}

export type StoredLocalActionType = ReturnType<typeof StoredLocalAction[keyof typeof StoredLocalAction]>
