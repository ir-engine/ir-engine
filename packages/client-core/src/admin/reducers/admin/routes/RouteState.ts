import { createState, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { RouteActionType } from './RouteActions'
import { Route } from '@xrengine/common/src/interfaces/Route'

export const ROUTE_PAGE_LIMIT = 100

const state = createState({})

export const adminRouteReducer = (_, action: RouteActionType) => {
  Promise.resolve().then(() => routeReceptor(action))
  return state.attach(Downgraded).value
}

const routeReceptor = (action: RouteActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
    }
  }, action.type)
}

export const accessRouteState = () => state
export const useRouteState = () => useState(state) as any as typeof state
