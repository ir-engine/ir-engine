import { Downgraded } from '@speigg/hookstate'

import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { addActionReceptor, defineAction, defineState, getState, useState } from '@xrengine/hyperflux'

const LocalState = defineState({
  name: 'LocalState',
  initial: () => ({
    authData: {} as any
  })
})

export const LocalStateServiceReceptor = (action) => {
  getState(LocalState).batch((s) => {
    matches(action).when(StoredLocalAction.storedLocal.matches, (action) => {
      s.merge(action.newState)
      localStorage.setItem(
        globalThis.process.env['VITE_LOCAL_STORAGE_KEY'] || 'xrengine-client-store-key-v1',
        JSON.stringify(s.attach(Downgraded).value)
      )
      return
    })
  })
}

if (typeof window !== 'undefined') {
  const rawState = localStorage.getItem(
    globalThis.process.env['VITE_LOCAL_STORAGE_KEY'] || 'xrengine-client-store-key-v1'
  )
  if (rawState) {
    const newState = JSON.parse(rawState)
    //console.log(newState)
    getState(LocalState).merge(newState)
  }
}

export const accessStoredLocalState = () => getState(LocalState)
export const useStoredLocalState = () => useState(accessStoredLocalState())

export class StoredLocalAction {
  static storedLocal = defineAction({
    type: 'STORE_LOCAL' as const,
    newState: matches.object
  })

  static restoreLocalData = defineAction({
    type: 'RESTORE' as const
  })
}
