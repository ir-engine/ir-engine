import { GroupUser } from './GroupUser'

export interface Group {
  id: string
  name: string
  description: string
  groupUsers: GroupUser[]
}
