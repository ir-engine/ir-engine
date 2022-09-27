import { Paginated } from '@feathersjs/feathers'

import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
export const SCOPE_PAGE_LIMIT = 100

const AdminScopeTypeState = defineState({
  name: 'AdminScopeTypeState',
  initial: () => ({
    skip: 0,
    limit: SCOPE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now(),
    scopeTypes: [] as Array<AdminScopeType>,
    fetching: false
  })
})

const getScopeTypesReceptor = (action: typeof AdminScopeTypeActions.getScopeTypes.matches._TYPE) => {
  const state = getState(AdminScopeTypeState)
  return state.merge({
    scopeTypes: action.adminScopeTypeResult.data,
    skip: action.adminScopeTypeResult.skip,
    limit: action.adminScopeTypeResult.limit,
    total: action.adminScopeTypeResult.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

export const AdminScopeTypeReceptor = {
  getScopeTypesReceptor
}

export const accessScopeTypeState = () => getState(AdminScopeTypeState)

export const useScopeTypeState = () => useState(accessScopeTypeState())

//Service
export const AdminScopeTypeService = {
  getScopeTypeService: async (incDec?: 'increment' | 'decrement') => {
    const scopeState = accessScopeTypeState()
    const skip = scopeState.skip.value
    const limit = scopeState.limit.value
    try {
      const result = (await API.instance.client.service('scope-type').find({
        query: {
          $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
          $limit: limit
        }
      })) as Paginated<AdminScopeType>
      dispatchAction(AdminScopeTypeActions.getScopeTypes({ adminScopeTypeResult: result }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class AdminScopeTypeActions {
  static getScopeTypes = defineAction({
    type: 'xre.client.AdminScopeType.SCOPE_TYPES_RETRIEVED' as const,
    adminScopeTypeResult: matches.object as Validator<unknown, Paginated<AdminScopeType>>
  })
}
