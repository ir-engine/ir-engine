import { Paginated } from '@feathersjs/feathers'

import { InstalledRoutesInterface } from '@xrengine/common/src/interfaces/Route'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState } from '../../user/services/AuthService'

//State
export const ROUTE_PAGE_LIMIT = 10000

const AdminRouteState = defineState({
  name: 'AdminRouteState',
  initial: () => ({
    routes: [] as Array<InstalledRoutesInterface>,
    skip: 0,
    limit: ROUTE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

const installedRoutesRetrievedReceptor = (action: typeof AdminRouteActions.installedRoutesRetrieved.matches._TYPE) => {
  const state = getState(AdminRouteState)
  return state.merge({ routes: action.data, updateNeeded: false })
}

export const AdminRouteReceptors = {
  installedRoutesRetrievedReceptor
}

export const accessRouteState = () => getState(AdminRouteState)

export const useRouteState = () => useState(accessRouteState())

//Service
export const RouteService = {
  fetchInstalledRoutes: async (incDec?: 'increment' | 'decrement') => {
    const user = accessAuthState().user
    try {
      if (user.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
        const routes = (await API.instance.client
          .service('routes-installed')
          .find()) as Paginated<InstalledRoutesInterface>
        dispatchAction(AdminRouteActions.installedRoutesRetrieved({ data: routes.data }))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class AdminRouteActions {
  static installedRoutesRetrieved = defineAction({
    type: 'xre.client.AdminRoute.ADMIN_ROUTE_INSTALLED_RECEIVED' as const,
    data: matches.array as Validator<unknown, InstalledRoutesInterface[]>
  })
}
