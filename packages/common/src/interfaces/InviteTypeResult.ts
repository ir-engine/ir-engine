import { InviteType } from './InviteType'

export interface InviteTypeResult {
  data: InviteType[]
  total: number
  limit: number
  skip: number
}
