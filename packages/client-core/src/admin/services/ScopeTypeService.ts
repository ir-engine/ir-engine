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
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

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

export const AdminScopeTypeService = {
  getScopeTypeService: async (page = 0) => {
    const scopeState = getMutableState(AdminScopeTypeState)
    const $limit = scopeState.limit.value
    const $skip = page * $limit
    try {
      const result = (await Engine.instance.api.service('scope-type').find({
        query: {
          $skip,
          $limit
        }
      })) as Paginated<AdminScopeType>
      getMutableState(AdminScopeTypeState).merge({
        scopeTypes: result.data,
        skip: result.skip,
        limit: result.limit,
        total: result.total,
        retrieving: false,
        fetched: true,
        updateNeeded: false,
        lastFetched: Date.now()
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
