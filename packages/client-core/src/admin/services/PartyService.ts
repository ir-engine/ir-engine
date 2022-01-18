import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { accessAuthState } from '../../user/services/AuthService'

import { createState, useState } from '@hookstate/core'

import { AdminPartyResult } from '@xrengine/common/src/interfaces/AdminPartyResult'
import { AdminParty } from '@xrengine/common/src/interfaces/AdminParty'

//State
export const PARTY_PAGE_LIMIT = 100

const state = createState({
  parties: [] as Array<AdminParty>,
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
          lastFetched: Date.now()
        })
      case 'PARTY_ADMIN_CREATED':
        return s.merge({ updateNeeded: true })
      case 'ADMIN_PARTY_REMOVED':
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
    {
      try {
        const result = await client.service('party').create(data)
        dispatch(PartyAction.partyAdminCreated(result))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  fetchAdminParty: async (incDec?: 'increment' | 'decrement', value: string | null = null) => {
    const dispatch = useDispatch()
    {
      const user = accessAuthState().user
      const adminParty = accessPartyState()
      const skip = adminParty.skip.value
      const limit = adminParty.limit.value
      try {
        if (user.userRole.value === 'admin') {
          const parties = await client.service('party').find({
            query: {
              // $sort: {
              //   createdAt: -1
              // },
              $skip: skip,
              $limit: limit,
              action: 'admin',
              search: value
            }
          })
          console.log(parties)
          dispatch(PartyAction.partyRetrievedAction(parties))
        }
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  removeParty: async (id: string) => {
    const dispatch = useDispatch()
    {
      const result = await client.service('party').remove(id)
      dispatch(PartyAction.partyRemoved(result))
    }
  }
}

//Action

export const PartyAction = {
  partyAdminCreated: (data: AdminParty) => {
    return {
      type: 'PARTY_ADMIN_CREATED' as const,
      data: data
    }
  },
  partyRetrievedAction: (data: AdminPartyResult) => {
    return {
      type: 'PARTY_ADMIN_DISPLAYED' as const,
      data: data
    }
  },
  partyRemoved: (party: AdminParty) => {
    return {
      type: 'ADMIN_PARTY_REMOVED' as const,
      party: party
    }
  }
}
export type PartyActionType = ReturnType<typeof PartyAction[keyof typeof PartyAction]>
