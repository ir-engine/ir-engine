import { createState, useState, none, Downgraded } from '@hookstate/core'
import { PartyActionType } from './PartActions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'

export const PARTY_PAGE_LIMIT = 100

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  parties: {
    parties: [],
    skip: 0,
    limit: PARTY_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
})

export const adminPartyReducer = (_, action: PartyActionType) => {
  Promise.resolve().then(() => partyReceptor(action))
  return state.attach(Downgraded).value
}

const partyReceptor = (action: PartyActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'PARTY_ADMIN_DISPLAYED':
        result = action.data.data
        return s.parties.merge({ parties: result, updateNeeded: false })
      case 'PARTY_ADMIN_CREATED':
        return s.parties.merge({ updateNeeded: true })
    }
  }, action.type)
}

export const accessPartyState = () => state
export const usePartyState = () => useState(state) as any as typeof state
