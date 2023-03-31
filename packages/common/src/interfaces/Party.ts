import { PartyUser } from './PartyUser'

export type Party = {
  id: string
  partyUsers?: PartyUser[]
  /** @deprecated */
  party_users?: PartyUser[]
  maxMembers: number
  name?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PatchParty {
  maxMembers: number
}
