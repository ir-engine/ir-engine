import {
  SENT_INVITES_RETRIEVED,
  RECEIVED_INVITES_RETRIEVED,
  INVITE_SENT,
  CREATED_RECEIVED_INVITE,
  REMOVED_RECEIVED_INVITE,
  CREATED_SENT_INVITE,
  REMOVED_SENT_INVITE,
  ACCEPTED_INVITE,
  DECLINED_INVITE,
  INVITE_TARGET_SET,
  FETCHING_SENT_INVITES,
  FETCHING_RECEIVED_INVITES
} from '../actions';

import { Invite } from '@xr3ngine/common/interfaces/Invite';
import { InviteResult } from '@xr3ngine/common/interfaces/InviteResult';

export interface InviteSentAction {
  type: string;
  id: string;
}

export type InviteAction =
    InviteSentAction

export function sentInvite(id: string): InviteAction {
  return {
    type: INVITE_SENT,
    id
  };
}
