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

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { routePath, RouteType } from '@etherealengine/engine/src/schemas/route/route.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'

//State
export const ROUTE_PAGE_LIMIT = 10000

export const AdminActiveRouteState = defineState({
  name: 'AdminActiveRouteState',
  initial: () => ({
    activeRoutes: [] as Array<RouteType>,
    skip: 0,
    limit: ROUTE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

const activeRoutesRetrievedReceptor = (action: typeof AdminActiveRouteActions.activeRoutesRetrieved.matches._TYPE) => {
  const state = getMutableState(AdminActiveRouteState)
  return state.merge({ activeRoutes: action.data, total: action.data.length, updateNeeded: false })
}

export const AdminActiveRouteReceptors = {
  activeRoutesRetrievedReceptor
}

//Service
export const AdminActiveRouteService = {
  setRouteActive: async (project: string, route: string, activate: boolean) => {
    const user = getMutableState(AuthState).user
    try {
      if (user.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
        await API.instance.client.service('route-activate').create({ project, route, activate })
        AdminActiveRouteService.fetchActiveRoutes()
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchActiveRoutes: async (incDec?: 'increment' | 'decrement') => {
    const user = getMutableState(AuthState).user
    try {
      if (user.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
        const routes = await API.instance.client.service(routePath).find({
          query: {
            $limit: ROUTE_PAGE_LIMIT
          }
        })
        dispatchAction(AdminActiveRouteActions.activeRoutesRetrieved({ data: routes.data }))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class AdminActiveRouteActions {
  static activeRoutesRetrieved = defineAction({
    type: 'ee.client.AdminActiveRoute.ADMIN_ROUTE_ACTIVE_RECEIVED' as const,
    data: matches.array as Validator<unknown, RouteType[]>
  })
}
