import { ActiveRoutesInterface } from '@xrengine/common/src/interfaces/Route'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'
import { accessAuthState } from '../../user/services/AuthService'

//State
export const ROUTE_PAGE_LIMIT = 10000

const AdminActiveRouteState = defineState({
  name: 'AdminActiveRouteState',
  initial: () => ({
    activeRoutes: [] as Array<ActiveRoutesInterface>,
    skip: 0,
    limit: ROUTE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const AdminActiveRouteServiceReceptor = (action) => {
  getState(AdminActiveRouteState).batch((s) => {
    matches(action).when(AdminActiveRouteActions.activeRoutesRetrievedAction.matches, (action) => {
      return s.merge({ activeRoutes: action.data, total: action.data.length, updateNeeded: false })
    })
  })
}

export const accessAdminActiveRouteState = () => getState(AdminActiveRouteState)

export const useAdminActiveRouteState = () => useState(accessAdminActiveRouteState())

//Service
export const AdminActiveRouteService = {
  setRouteActive: async (project: string, route: string, activate: boolean) => {
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        await client.service('route-activate').create({ project, route, activate })
        AdminActiveRouteService.fetchActiveRoutes()
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchActiveRoutes: async (incDec?: 'increment' | 'decrement') => {
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        const routes = await client.service('route').find({ paginate: false })
        dispatchAction(
          AdminActiveRouteActions.activeRoutesRetrievedAction({ data: routes.data as Array<ActiveRoutesInterface> })
        )
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class AdminActiveRouteActions {
  static activeRoutesRetrievedAction = defineAction({
    type: 'ADMIN_ROUTE_ACTIVE_RECEIVED' as const,
    data: matches.array as Validator<unknown, ActiveRoutesInterface[]>
  })
}
