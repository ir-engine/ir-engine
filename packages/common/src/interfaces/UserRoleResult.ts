import { UserRole } from './UserRole'

export interface UserRoleResult {
  data: UserRole[]
  total: number
  limit: number
  skip: number
}
