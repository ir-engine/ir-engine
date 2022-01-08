import { createState, useState } from '@hookstate/core'

import { AlertService } from '../../common/services/AlertService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { accessAuthState } from '../../user/services/AuthService'

//State
export const ROUTE_PAGE_LIMIT = 10000

const state = createState({
  routes: [] as {
    id: string
    project: string
    routes: string[]
  }[],
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
        return s.merge({ routes: action.data.data, updateNeeded: false })
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
        const routes = await client.service('routes-installed').find()
        dispatch(RouteActions.installedRoutesRetrievedAction(routes))
      }
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  }
}

//Action
export const RouteActions = {
  installedRoutesRetrievedAction: (data: any) => {
    return {
      type: 'ADMIN_ROUTE_INSTALLED_RECEIVED' as const,
      data: data
    }
  }
}

export type RouteActionType = ReturnType<typeof RouteActions[keyof typeof RouteActions]>
