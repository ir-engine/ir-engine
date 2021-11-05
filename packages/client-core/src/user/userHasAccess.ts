import { useAuthState } from './services/AuthService'

export const userHasAccess = (scope: string) => {
  const hasScope = useAuthState().user?.scopes?.value?.find((r) => r.type === scope)
  const isAdmin = useAuthState().user?.userRole?.value === 'admin'
  return Boolean(hasScope || isAdmin)
}
