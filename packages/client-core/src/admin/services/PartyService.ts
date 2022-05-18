import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { Party, PatchParty } from '@xrengine/common/src/interfaces/Party'

import { AlertService } from '../../common/services/AlertService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { accessAuthState } from '../../user/services/AuthService'

//State
export const PARTY_PAGE_LIMIT = 100

const state = createState({
  parties: [] as Array<Party>,
  skip: 0,
  limit: PARTY_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now()
})

store.receptors.push((action: PartyActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'PARTY_ADMIN_DISPLAYED':
        return s.merge({
          parties: action.data.data,
          updateNeeded: false,
          skip: action.data.skip,
          limit: action.data.limit,
          total: action.data.total,
          fetched: true,
          lastFetched: Date.now()
        })
      case 'PARTY_ADMIN_CREATED':
        return s.merge({ updateNeeded: true })
      case 'ADMIN_PARTY_REMOVED':
        return s.merge({ updateNeeded: true })
      case 'ADMIN_PARTY_PATCHED':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessPartyState = () => state

export const usePartyState = () => useState(state) as any as typeof state

//Service
export const PartyService = {
  createAdminParty: async (data) => {
    const dispatch = useDispatch()

    try {
      const result = (await client.service('party').create(data)) as Party
      dispatch(PartyAction.partyAdminCreated(result))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  fetchAdminParty: async (value: string | null = null, skip = 0, sortField = 'location', orderBy = 'asc') => {
    const dispatch = useDispatch()

    const user = accessAuthState().user

    try {
      if (user.userRole.value === 'admin') {
        let sortData = {}
        if (sortField.length > 0) {
          sortData[sortField] = orderBy === 'desc' ? 0 : 1
        }
        const parties = (await client.service('party').find({
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

        dispatch(PartyAction.partyRetrievedAction(parties))
      }
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  removeParty: async (id: string) => {
    const dispatch = useDispatch()

    const result = (await client.service('party').remove(id)) as Party
    dispatch(PartyAction.partyRemoved(result))
  },
  patchParty: async (id: string, party: PatchParty) => {
    const dispatch = useDispatch()

    try {
      const result = (await client.service('party').patch(id, party)) as Party
      dispatch(PartyAction.partyPatched(result))
    } catch (error) {
      AlertService.dispatchAlertError(error)
    }
  }
}

//Action

export const PartyAction = {
  partyAdminCreated: (data: Party) => {
    return {
      type: 'PARTY_ADMIN_CREATED' as const,
      data: data
    }
  },
  partyRetrievedAction: (data: Paginated<Party>) => {
    return {
      type: 'PARTY_ADMIN_DISPLAYED' as const,
      data: data
    }
  },
  partyRemoved: (party: Party) => {
    return {
      type: 'ADMIN_PARTY_REMOVED' as const,
      party: party
    }
  },
  partyPatched: (party: Party) => {
    return {
      type: 'ADMIN_PARTY_PATCHED' as const,
      party: party
    }
  }
}
export type PartyActionType = ReturnType<typeof PartyAction[keyof typeof PartyAction]>
