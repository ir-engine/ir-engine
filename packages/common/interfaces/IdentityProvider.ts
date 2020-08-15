export interface IdentityProvider {
  id: number
  token: string
  type: string
  isVerified: boolean
  userId: string
}

export const IdentityProviderSeed: IdentityProvider = {
  id: 0,
  token: '',
  type: '',
  isVerified: false,
  userId: ''
}
