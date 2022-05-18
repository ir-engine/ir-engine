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
        return s.merge({ parties: action.data.data, updateNeeded: false })
      case 'PARTY_ADMIN_CREATED':
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
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  fetchAdminParty: async (incDec?: 'increment' | 'decrement') => {
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
              $sort: {
                createdAt: -1
              },
              $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
              $limit: limit
            }
          })
          dispatch(PartyAction.partyRetrievedAction(parties))
        }
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
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
  }
}
export type PartyActionType = ReturnType<typeof PartyAction[keyof typeof PartyAction]>
