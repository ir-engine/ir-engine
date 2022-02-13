import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/services/AlertService'
import { accessAuthState } from '../../user/services/AuthService'

import { createState, useState } from '@speigg/hookstate'
import { ActiveRoutesInterface } from '@xrengine/common/src/interfaces/Route'

//State
export const ROUTE_PAGE_LIMIT = 10000

const state = createState({
  activeRoutes: [] as Array<ActiveRoutesInterface>,
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
      case 'ADMIN_ROUTE_ACTIVE_RECEIVED':
        return s.merge({ activeRoutes: action.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessActiveRouteState = () => state

export const useActiveRouteState = () => useState(state) as any as typeof state

//Service
export const ActiveRouteService = {
  setRouteActive: async (project: string, route: string, activate: boolean) => {
    const dispatch = useDispatch()
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        await client.service('route-activate').create({ project, route, activate })
        ActiveRouteService.fetchActiveRoutes()
      }
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  },
  fetchActiveRoutes: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        const routes = await client.service('route').find({ paginate: false })
        dispatch(ActiveRouteActions.activeRoutesRetrievedAction(routes.data as Array<ActiveRoutesInterface>))
      }
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  }
}

//Action
export const ActiveRouteActions = {
  activeRoutesRetrievedAction: (data: Array<ActiveRoutesInterface>) => {
    return {
      type: 'ADMIN_ROUTE_ACTIVE_RECEIVED' as const,
      data: data
    }
  }
}

export type RouteActionType = ReturnType<typeof ActiveRouteActions[keyof typeof ActiveRouteActions]>
