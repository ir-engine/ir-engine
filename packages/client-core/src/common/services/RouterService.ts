import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

export const RouterState = defineState({
  name: 'RouterState',
  initial: () => ({
    pathname: location.pathname
  })
})

export const RouterServiceReceptor = (action) => {
  const s = getState(RouterState)
  matches(action).when(RouterAction.route.matches, (action) => {
    s.pathname.set(action.pathname)
  })
}

export const useRouter = () => {
  return (pathname: string) => {
    dispatchAction(RouterAction.route({ pathname }))
  }
}

export class RouterAction {
  static route = defineAction({
    type: 'xre.client.Router.ROUTE' as const,
    pathname: matches.string
  })
}
