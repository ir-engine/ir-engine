import { UserInterface } from './UserInterface'

export interface MatchUserInterface {
  id: string
  ticketId?: string
  gamemode?: string
  connection?: string
  userId?: string
  user?: UserInterface
  createdAt?: string
  updatedAt?: string
}
