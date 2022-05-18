import { createState, Downgraded, useState } from '@speigg/hookstate'
import { store } from '../store'

const state = createState({
  authData: {} as any
})

type StateTypes = Partial<typeof state.value>

export const accessStoredLocalState = () => state
export const useStoredLocalState = () => useState(state) as any as typeof state

if (typeof window !== 'undefined') {
  const rawState = localStorage.getItem(
    globalThis.process.env['VITE_LOCAL_STORAGE_KEY'] || 'xrengine-client-store-key-v1'
  )
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
          globalThis.process.env['VITE_LOCAL_STORAGE_KEY'] || 'xrengine-client-store-key-v1',
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
