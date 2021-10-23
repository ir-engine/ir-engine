import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { RouteActionType } from './RouteActions'
import { store } from '../../store'

export const ROUTE_PAGE_LIMIT = 10000

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
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
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_ROUTE_INSTALLED_RECEIVED':
        result = action.data.data
        return s.routes.merge({ routes: result, updateNeeded: false })
      case 'ADMIN_ROUTE_ACTIVE_RECEIVED':
        result = action.data.data
        return s.routes.merge({ activeRoutes: result, updateNeeded: false })
    }
  }, action.type)
})

export const accessRouteState = () => state

export const useRouteState = () => useState(state) as any as typeof state
