/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Paginated } from '@feathersjs/feathers'

import { AdminScopeType } from '@etherealengine/common/src/interfaces/AdminScopeType'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
export const SCOPE_PAGE_LIMIT = 100

export const AdminScopeTypeState = defineState({
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
  const state = getMutableState(AdminScopeTypeState)
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

//Service
export const AdminScopeTypeService = {
  getScopeTypeService: async (incDec?: 'increment' | 'decrement') => {
    const scopeState = getMutableState(AdminScopeTypeState)
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
    type: 'ee.client.AdminScopeType.SCOPE_TYPES_RETRIEVED' as const,
    adminScopeTypeResult: matches.object as Validator<unknown, Paginated<AdminScopeType>>
  })
}
