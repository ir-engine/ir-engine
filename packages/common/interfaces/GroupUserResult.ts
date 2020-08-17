import { GroupUser } from './GroupUser'

export interface GroupUserResult {
  data: GroupUser[]
  total: number
  limit: number
  skip: number
}
