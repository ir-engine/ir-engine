import { ActiveRoutesInterface } from '@etherealengine/common/src/interfaces/Route'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'

//State
export const ROUTE_PAGE_LIMIT = 10000

export const AdminActiveRouteState = defineState({
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
        const routes = await API.instance.client.service('route').find({ paginate: false })
        dispatchAction(
          AdminActiveRouteActions.activeRoutesRetrieved({ data: routes.data as Array<ActiveRoutesInterface> })
        )
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
    data: matches.array as Validator<unknown, ActiveRoutesInterface[]>
  })
}
