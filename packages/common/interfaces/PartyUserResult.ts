import { PartyUser } from './PartyUser'

export interface PartyUserResult {
  data: PartyUser[]
  total: number
  limit: number
  skip: number
}
