import {
  SENT_INVITES_RETRIEVED,
  RECEIVED_INVITES_RETRIEVED,
  INVITE_SENT,
  REMOVED_INVITE,
  ACCEPTED_INVITE,
  DECLINED_INVITE
} from '../actions'

import { Invite } from '../../../shared/interfaces/Invite'
import { InviteResult } from '../../../shared/interfaces/InviteResult'

export interface InviteSentAction {
  type: string,
  id: string
}

export interface InvitesRetrievedAction {
  type: string,
  invites: Invite[],
  total: number,
  limit: number
  skip: number
}

export interface InviteRemovedAction {
  type: string
}

export type InviteAction =
    InviteSentAction
    | InvitesRetrievedAction
    | InviteRemovedAction

export function sentInvite(id: string): InviteAction {
  return {
    type: INVITE_SENT,
    id
  }
}

export function retrievedSentInvites(inviteResult: InviteResult): InviteAction {
  return {
    type: SENT_INVITES_RETRIEVED,
    invites: inviteResult.data,
    total: inviteResult.total,
    limit: inviteResult.limit,
    skip: inviteResult.skip
  }
}

export function retrievedReceivedInvites(inviteResult: InviteResult): InviteAction {
  return {
    type: RECEIVED_INVITES_RETRIEVED,
    invites: inviteResult.data,
    total: inviteResult.total,
    limit: inviteResult.limit,
    skip: inviteResult.skip
  }
}
export function removedInvite(): InviteAction {
  return {
    type: REMOVED_INVITE
  }
}

export function acceptedInvite(): InviteAction {
  return {
    type: ACCEPTED_INVITE
  }
}

export function declinedInvite(): InviteAction {
  return {
    type: DECLINED_INVITE
  }
}