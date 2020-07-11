import {
  SENT_INVITES_RETRIEVED,
  RECEIVED_INVITES_RETRIEVED,
  INVITE_SENT,
  REMOVED_INVITE
} from '../actions'

import { Invite } from '../../../shared/interfaces/Invite'

export interface InviteSentAction {
  type: string,
  id: string
}

export interface InvitesRetrievedAction {
  type: string,
  invites: Invite[]
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

export function retrievedSentInvites(invites: Invite[]): InviteAction {
  return {
    type: SENT_INVITES_RETRIEVED,
    invites: invites
  }
}

export function retrievedReceivedInvites(invites: Invite[]): InviteAction {
  return {
    type: RECEIVED_INVITES_RETRIEVED,
    invites: invites
  }
}
export function removedInvite(): InviteAction {
  return {
    type: REMOVED_INVITE
  }
}