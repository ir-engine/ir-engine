import { PartyUser } from './PartyUser'

export type PartyUserResult = {
  data: PartyUser[],
  total: number,
  limit: number
  skip: number
}