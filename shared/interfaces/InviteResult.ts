import { Invite } from './Invite'

export type InviteResult = {
  data: Invite[],
  total: number,
  limit: number
  skip: number
}