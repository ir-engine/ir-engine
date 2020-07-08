import {
  INVITE_SENT
} from '../actions'

export interface InviteSentAction {
  type: string,
  id: string
}

export type InviteAction =
    InviteSentAction

export function sentInvite(id: string): InviteAction {
  return {
    type: INVITE_SENT,
    id
  }
}