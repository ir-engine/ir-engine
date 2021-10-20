import { createState, DevTools, useState, Downgraded } from '@hookstate/core'
import { PartyActionType } from './PartActions'
import { UserSeed } from '@standardcreative/common/src/interfaces/User'
import { IdentityProviderSeed } from '@standardcreative/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@standardcreative/common/src/interfaces/AuthUser'
import { AdminParty } from '@standardcreative/common/src/interfaces/AdminParty'

export const PARTY_PAGE_LIMIT = 100

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  parties: {
    parties: [] as Array<AdminParty>,
    skip: 0,
    limit: PARTY_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  }
})

export const receptor = (action: PartyActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'PARTY_ADMIN_DISPLAYED':
        result = action.data
        return s.parties.merge({ parties: result.data, updateNeeded: false })
      case 'PARTY_ADMIN_CREATED':
        return s.parties.merge({ updateNeeded: true })
    }
  }, action.type)
}

export const accessPartyState = () => state

export const usePartyState = () => useState(state) as any as typeof state
