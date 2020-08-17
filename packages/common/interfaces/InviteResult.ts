import { Invite } from './Invite'

export interface InviteResult {
  data: Invite[]
  total: number
  limit: number
  skip: number
}
