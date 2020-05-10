import { IdentityProvider } from './IdentityProvider'

export type AuthUser = {
  accessToken: string
  authentication: {
      strategy: string
  },
  identityProvider: IdentityProvider
}

export function resolveAuthUser(res: any): AuthUser {
  return {
    accessToken: res.accessToken,
    authentication: res.authentication,
    identityProvider: res['identity-provider']
  }
}
