import { Downgraded } from '@hookstate/core'

import { AuthUser } from '@xrengine/common/src/interfaces/AuthUser'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { addActionReceptor, defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

const LocalState = defineState({
  name: 'LocalState',
  initial: () => ({
    authUser: null! as AuthUser
  })
})

export const LocalStateServiceReceptor = (action) => {
  const s = getState(LocalState)
  matches(action).when(StoredLocalAction.storedLocal.matches, (action) => {
    s.merge(action.newState)
    const newState = s.attach(Downgraded).value
    localStorage.setItem(
      globalThis.process.env['VITE_LOCAL_STORAGE_KEY'] || 'xrengine-client-store-key-v1',
      JSON.stringify(newState)
    )
  })
}

export const accessStoredLocalState = () => getState(LocalState)
export const useStoredLocalState = () => useState(accessStoredLocalState())

export const StoredLocalStoreService = {
  fetchLocalStoredState: () => {
    console.log('fetchLocalStoredState')
    if (typeof window !== 'undefined') {
      const rawState = localStorage.getItem(
        globalThis.process.env['VITE_LOCAL_STORAGE_KEY'] || 'xrengine-client-store-key-v1'
      )
      if (rawState) {
        const newState = JSON.parse(rawState)
        // Don't use dispatch method here, must be synchronous
        getState(LocalState).merge(newState)
      }
    }
  }
}

export class StoredLocalAction {
  static storedLocal = defineAction({
    type: 'xre.client.StoredLocal.STORE_LOCAL' as const,
    newState: matches.object
  })

  static restoreLocalData = defineAction({
    type: 'xre.client.StoredLocal.RESTORE' as const
  })
}
