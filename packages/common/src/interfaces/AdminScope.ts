import { AdminScopeType } from './AdminScopeType'
import { Group } from './Group'
import { User } from './User'

export interface AdminScope {
  id: string
  createdAt: string
  updatedAt: string
  userId?: string
  groupId?: string
  type: string
  scopeType?: AdminScopeType
  user?: User
  group?: Group
}
