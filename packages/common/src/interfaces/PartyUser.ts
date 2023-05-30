import { Channel } from './Channel'
import { Instance } from './Instance'
import { UserInterface } from './User'

export type PartyUser = {
  id: string
  isOwner: boolean
  // user: UserInterface
  partyId?: string
  userId?: string
  user?: UserInterface
  instance?: Instance
  channel?: Channel
}
