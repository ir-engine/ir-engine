export interface IdentityProviderInterface {
  id: string
  token: string
  password: string
  isVerified: boolean
  verifyToken: string
  verifyShortToken: string
  verifyExpires: Date
  verifyChanges: string
  resetToken: string
  resetExpires: Date
  type: string
}
