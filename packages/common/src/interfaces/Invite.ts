import { UserInterface } from './User'

export type Invite = {
  id: string
  inviteType: string
  groupName?: string
  invitee: UserInterface
  inviteeId: string
  token: string
  user: UserInterface
  userId: string
  passcode: string
  identityProviderType: string
  createdAt: string
  updatedAt: string
}

export const InviteSeed = {
  id: ''
}

export interface SendInvite {
  type: string
  token: string
  inviteCode?: string | null
  invitee: string | null
  identityProviderType: string
  targetObjectId: string
}
