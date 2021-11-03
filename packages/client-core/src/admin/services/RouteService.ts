import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/services/AlertService'
import { accessAuthState } from '../../user/services/AuthService'

import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'

//State
export const ROUTE_PAGE_LIMIT = 10000

const state = createState({
  routes: {
    routes: [] as {
      id: string
      project: string
      routes: string[]
    }[],
    activeRoutes: [] as {
      project: string
      route: string
    }[],
    skip: 0,
    limit: ROUTE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  }
})

store.receptors.push((action: RouteActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_ROUTE_INSTALLED_RECEIVED':
        return s.merge({
          routes: {
            ...s.routes.value,
            routes: action.data.data,
            updateNeeded: false
          }
        })
      case 'ADMIN_ROUTE_ACTIVE_RECEIVED':
        return s.merge({
          routes: {
            ...s.routes.value,
            activeRoutes: action.data.data,
            updateNeeded: false
          }
        })
    }
  }, action.type)
})

export const accessRouteState = () => state

export const useRouteState = () => useState(state) as any as typeof state

//Service
export const RouteService = {
  setRouteActive: async (project: string, route: string, activate: boolean) => {
    const dispatch = useDispatch()
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        await client.service('route-activate').create({ project, route, activate })
        RouteService.fetchActiveRoutes()
      }
    } catch (err) {
      console.error(err)
      AlertService.dispatchAlertError(err.message)
    }
  },
  fetchActiveRoutes: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        const routes = await client.service('route').find({ paginate: false })
        dispatch(RouteActions.activeRoutesRetrievedAction(routes))
      }
    } catch (err) {
      console.error(err)
      AlertService.dispatchAlertError(err.message)
    }
  },
  fetchInstalledRoutes: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        const routes = await client.service('routes-installed').find()
        dispatch(RouteActions.installedRoutesRetrievedAction(routes))
      }
    } catch (err) {
      console.error(err)
      AlertService.dispatchAlertError(err.message)
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
  },
  activeRoutesRetrievedAction: (data: any) => {
    return {
      type: 'ADMIN_ROUTE_ACTIVE_RECEIVED' as const,
      data: data
    }
  }
}

export type RouteActionType = ReturnType<typeof RouteActions[keyof typeof RouteActions]>
