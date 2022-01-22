import { UserId } from './UserId'

export interface UserApiKey {
  id: string
  token: string
  userId: UserId
}
