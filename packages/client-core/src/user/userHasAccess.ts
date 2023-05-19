import { accessAuthState, useAuthState } from './services/AuthService'

export const userHasAccessHook = (scope: string) => {
  const hasScope = useAuthState().user?.scopes?.value?.find((r) => r.type === scope)
  const isAdmin = useAuthState().user?.scopes?.value?.find((r) => r.type === 'admin:admin')
  return Boolean(hasScope || isAdmin)
}

export const userHasAccess = (scope: string) => {
  const hasScope = accessAuthState().user?.scopes?.value?.find((r) => r.type === scope)
  const isAdmin = accessAuthState().user?.scopes?.value?.find((r) => r.type === 'admin:admin')
  return Boolean(hasScope || isAdmin)
}
