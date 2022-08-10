import { UserInterface } from './User'

export type Invite = {
  id: string
  inviteType: string
  groupName?: string
  invitee?: UserInterface
  inviteeId?: string
  token?: string
  targetObjectId?: string
  user?: UserInterface
  userId: string
  passcode: string
  identityProviderType?: string
  createdAt: string
  updatedAt: string
  makeAdmin: boolean
  deleteOnUse: boolean
  spawnType?: string
  spawnDetails?: { inviteCode?: string; spawnPoint?: string; spectate?: string } | string | null
  timed?: boolean
  startTime?: Date | null
  endTime?: Date | null
}

export const InviteSeed = {
  id: ''
}

export interface SendInvite {
  inviteType: string
  token: string | null
  inviteCode?: string | null
  inviteeId?: string | null
  identityProviderType?: string | null
  targetObjectId?: string | null
  makeAdmin?: boolean | null
  deleteOnUse?: boolean | null
  spawnType?: string | null
  spawnDetails?: { inviteCode?: string; spawnPoint?: string; spectate?: string } | string | null
  timed?: boolean
  startTime?: Date | null
  endTime?: Date | null
}

export interface InviteInterface {
  id: string
  inviteType: string
  token?: string
  passcode: string
  inviteeId?: string
  invitee?: UserInterface
  identityProviderType?: string
  targetObjectId?: string
  makeAdmin: boolean
  deleteOnUse: boolean
  spawnType?: string
  spawnDetails?: { inviteCode?: string; spawnPoint?: string; spectate?: string } | string | null
  createdAt: string
  updatedAt: string
  userId: string
  timed?: boolean
  startTime?: Date | null
  endTime?: Date | null
}
