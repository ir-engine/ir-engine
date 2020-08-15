import { User } from './User'

export interface FriendResult {
  data: User[]
  total: number
  limit: number
  skip: number
}
