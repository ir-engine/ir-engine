import { getState } from '@etherealengine/hyperflux'

import { AuthState } from './services/AuthService'

export const userHasAccessHook = (scope: string) => {
  const authState = getState(AuthState)
  const hasScope = authState.user?.scopes?.find((r) => r.type === scope)
  const isAdmin = authState.user?.scopes?.find((r) => r.type === 'admin:admin')
  return Boolean(hasScope || isAdmin)
}

export const userHasAccess = (scope: string) => {
  const authState = getState(AuthState)
  const hasScope = authState.user?.scopes?.find((r) => r.type === scope)
  const isAdmin = authState.user?.scopes?.find((r) => r.type === 'admin:admin')
  return Boolean(hasScope || isAdmin)
}
