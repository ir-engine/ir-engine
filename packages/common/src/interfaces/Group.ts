import { GroupUser } from './GroupUser'

export type Group = {
  id?: string
  name?: string
  description?: string
  groupUsers?: GroupUser[]
  scopes?: GroupScope[]
  createdAt?: string
  updatedAt?: string
}

export type GroupScope = {
  id: string
  type: string
}
