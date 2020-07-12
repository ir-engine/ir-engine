import { User } from './User'

export type Invite = {
  id: string
  invitee: User
  token: string
  user: User,
  createdAt: any
}

export const InviteSeed = {
  id: ''
}