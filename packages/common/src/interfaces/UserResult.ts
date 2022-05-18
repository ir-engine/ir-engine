import { User } from './User'

export interface UserResult {
  data: User[]
  total: number
  limit: number
  skip: number
}
