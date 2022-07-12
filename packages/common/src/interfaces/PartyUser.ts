import { UserInterface } from './User'

export type PartyUser = {
  id: string
  isOwner: boolean
  user: UserInterface
  partyId?: string
  userId?: string
}
