import { User } from './User'

export interface Invite {
  id: string
  invitee: User
  token: string
  user: User
  createdAt: any
}

export const InviteSeed = {
  id: ''
}
