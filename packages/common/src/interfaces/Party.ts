import { Instance } from './Instance'
import { Location } from './Location'
import { PartyUser } from './PartyUser'

export type Party = {
  id: string
  partyUsers: PartyUser[]
  instance?: Instance
  instanceId?: string
  maxMembers: number
  name?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PatchParty {
  instanceId?: string
  maxMembers: number
}
