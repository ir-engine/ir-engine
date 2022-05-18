import { User } from './User'

export type PartyUser = {
  id: string
  isOwner: boolean
  user: User
}
