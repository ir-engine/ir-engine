import { IdentityProvider, IdentityProviderSeed } from './IdentityProvider'

export interface AuthUser {
  accessToken: string
  authentication: {
    strategy: string
  }
  identityProvider: IdentityProvider
}

export const AuthUserSeed: AuthUser = {
  accessToken: '',
  authentication: {
    strategy: ''
  },
  identityProvider: IdentityProviderSeed
}

export function resolveAuthUser(res: any): AuthUser {
  return {
    accessToken: res.accessToken,
    authentication: res.authentication,
    identityProvider: res['identity-provider']
  }
}
