import { User } from './User'

export interface PartyUser {
  id: string
  isOwner: boolean
  user: User
}
