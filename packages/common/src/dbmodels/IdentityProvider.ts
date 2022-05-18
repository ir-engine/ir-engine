import { UserId } from '../interfaces/UserId'

export interface IdentityProviderInterface {
  id: string
  token: string
  password: string
  isVerified: string
  verifyToken: string
  verifyShortToken: string
  verifyExpires: string
  verifyChanges: string
  resetToken: string
  resetExpires: string
  type: string
  userId: UserId
}
