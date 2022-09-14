import { Paginated } from '@feathersjs/feathers'

import { Party, PatchParty } from '@xrengine/common/src/interfaces/Party'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'

//State
export const PARTY_PAGE_LIMIT = 100

const AdminPartyState = defineState({
  name: 'AdminPartyState',
  initial: () => ({
    parties: [] as Array<Party>,
    skip: 0,
    limit: PARTY_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

const partyRetrievedReceptor = (action: typeof AdminPartyActions.partyRetrieved.matches._TYPE) => {
  const state = getState(AdminPartyState)
  return state.merge({
    parties: action.party.data,
    updateNeeded: false,
    skip: action.party.skip,
    limit: action.party.limit,
    total: action.party.total,
    fetched: true,
    lastFetched: Date.now()
  })
}

const partyAdminCreatedReceptor = (action: typeof AdminPartyActions.partyAdminCreated.matches._TYPE) => {
  const state = getState(AdminPartyState)
  return state.merge({ updateNeeded: true })
}

const partyRemovedReceptor = (action: typeof AdminPartyActions.partyRemoved.matches._TYPE) => {
  const state = getState(AdminPartyState)
  return state.merge({ updateNeeded: true })
}

const partyPatchedReceptor = (action: typeof AdminPartyActions.partyPatched.matches._TYPE) => {
  const state = getState(AdminPartyState)
  return state.merge({ updateNeeded: true })
}

export const AdminPartyReceptors = {
  partyRetrievedReceptor,
  partyAdminCreatedReceptor,
  partyRemovedReceptor,
  partyPatchedReceptor
}

export const accessPartyState = () => getState(AdminPartyState)

export const usePartyState = () => useState(accessPartyState())

//Service
export const AdminPartyService = {
  createAdminParty: async (data) => {
    try {
      const party = (await API.instance.client.service('party').create(data)) as Party
      dispatchAction(AdminPartyActions.partyAdminCreated({ party }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchAdminParty: async (value: string | null = null, skip = 0, sortField = 'maxMembers', orderBy = 'asc') => {
    const user = accessAuthState().user

    try {
      if (user.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
        let sortData = {}
        if (sortField.length > 0) {
          sortData[sortField] = orderBy === 'desc' ? 0 : 1
        }
        const party = (await API.instance.client.service('party').find({
          query: {
            $sort: {
              ...sortData
            },
            $skip: skip * PARTY_PAGE_LIMIT,
            $limit: PARTY_PAGE_LIMIT,
            action: 'admin',
            search: value
          }
        })) as Paginated<Party>

        dispatchAction(AdminPartyActions.partyRetrieved({ party }))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeParty: async (id: string) => {
    const party = (await API.instance.client.service('party').remove(id)) as Party
    dispatchAction(AdminPartyActions.partyRemoved({ party }))
  },
  patchParty: async (id: string, party: PatchParty) => {
    try {
      const result = (await API.instance.client.service('party').patch(id, party)) as Party
      dispatchAction(AdminPartyActions.partyPatched({ party: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action

export class AdminPartyActions {
  static partyAdminCreated = defineAction({
    type: 'xre.client.AdminParty.PARTY_ADMIN_CREATED' as const,
    party: matches.object as Validator<unknown, Party>
  })

  static partyRetrieved = defineAction({
    type: 'xre.client.AdminParty.PARTY_ADMIN_DISPLAYED' as const,
    party: matches.object as Validator<unknown, Paginated<Party>>
  })

  static partyRemoved = defineAction({
    type: 'xre.client.AdminParty.ADMIN_PARTY_REMOVED' as const,
    party: matches.object as Validator<unknown, Party>
  })

  static partyPatched = defineAction({
    type: 'xre.client.AdminParty.ADMIN_PARTY_PATCHED' as const,
    party: matches.object as Validator<unknown, Party>
  })
}
