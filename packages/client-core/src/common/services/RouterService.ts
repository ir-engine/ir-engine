import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

export const RouterState = defineState({
  name: 'RouterState',
  initial: () => ({
    pathname: location.pathname
  })
})

export const RouterServiceReceptor = (action) => {
  const s = getMutableState(RouterState)
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
    type: 'ee.client.Router.ROUTE' as const,
    pathname: matches.string
  })
}
