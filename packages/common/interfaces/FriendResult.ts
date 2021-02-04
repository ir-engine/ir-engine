import { User } from './User'

export type FriendResult = {
  data: User[],
  total: number,
  limit: number
  skip: number
}