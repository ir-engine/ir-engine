import { AdminParty } from './AdminParty'

export interface AdminPartyResult {
  data: AdminParty[]
  total: number
  limit: number
  skip: number
}
