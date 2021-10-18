import { GroupUser } from './GroupUser'

export type Group = {
  id?: string
  name?: string
  description?: string
  groupUsers?: GroupUser[]
  createdAt?: string
  updatedAt?: string
}
