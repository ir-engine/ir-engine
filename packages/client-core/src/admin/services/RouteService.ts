import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { InstalledRoutesInterface } from '@xrengine/common/src/interfaces/Route'

import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { accessAuthState } from '../../user/services/AuthService'

//State
export const ROUTE_PAGE_LIMIT = 10000

const state = createState({
  routes: [] as Array<InstalledRoutesInterface>,
  skip: 0,
  limit: ROUTE_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now()
})

store.receptors.push((action: RouteActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_ROUTE_INSTALLED_RECEIVED':
        return s.merge({ routes: action.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessRouteState = () => state

export const useRouteState = () => useState(state) as any as typeof state

//Service
export const RouteService = {
  fetchInstalledRoutes: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        const routes = (await client.service('routes-installed').find()) as Paginated<InstalledRoutesInterface>
        dispatch(RouteActions.installedRoutesRetrievedAction(routes.data))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export const RouteActions = {
  installedRoutesRetrievedAction: (data: Array<InstalledRoutesInterface>) => {
    return {
      type: 'ADMIN_ROUTE_INSTALLED_RECEIVED' as const,
      data: data
    }
  }
}

export type RouteActionType = ReturnType<typeof RouteActions[keyof typeof RouteActions]>
