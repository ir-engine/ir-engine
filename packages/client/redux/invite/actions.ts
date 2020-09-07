import {
  SENT_INVITES_RETRIEVED,
  RECEIVED_INVITES_RETRIEVED,
  INVITE_SENT,
  REMOVED_INVITE,
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

export interface InvitesRetrievedAction {
  type: string;
  invites: Invite[];
  total: number;
  limit: number;
  skip: number;
}

export interface InviteRemovedAction {
  type: string;
}

export interface InviteTargetSetAction {
  type: string;
  targetObjectType: string | null;
  targetObjectId: string | null;
}

export interface FetchingSentInvitesAction {
  type: string;
}

export interface FetchingReceivedInvitesAction {
  type: string;
}

export type InviteAction =
    InviteSentAction
    | InvitesRetrievedAction
    | InviteRemovedAction
    | InviteTargetSetAction
    | FetchingReceivedInvitesAction
    | FetchingSentInvitesAction

export function sentInvite(id: string): InviteAction {
  return {
    type: INVITE_SENT,
    id
  };
}

export function retrievedSentInvites(inviteResult: InviteResult): InviteAction {
  return {
    type: SENT_INVITES_RETRIEVED,
    invites: inviteResult.data,
    total: inviteResult.total,
    limit: inviteResult.limit,
    skip: inviteResult.skip
  };
}

export function retrievedReceivedInvites(inviteResult: InviteResult): InviteAction {
  return {
    type: RECEIVED_INVITES_RETRIEVED,
    invites: inviteResult.data,
    total: inviteResult.total,
    limit: inviteResult.limit,
    skip: inviteResult.skip
  };
}
export function removedInvite(): InviteAction {
  return {
    type: REMOVED_INVITE
  };
}

export function acceptedInvite(): InviteAction {
  return {
    type: ACCEPTED_INVITE
  };
}

export function declinedInvite(): InviteAction {
  return {
    type: DECLINED_INVITE
  };
}

export function setInviteTarget(targetObjectType: string, targetObjectId: string): InviteAction {
  return {
    type: INVITE_TARGET_SET,
    targetObjectId: targetObjectId,
    targetObjectType: targetObjectType
  };
}

export function fetchingSentInvites(): InviteAction {
  return {
    type: FETCHING_SENT_INVITES
  };
}

export function fetchingReceivedInvites(): InviteAction {
  return {
    type: FETCHING_RECEIVED_INVITES
  };
}