import { FETCHING_RECEIVED_INVITES_TYPES, INVITE_TYPE_CREATE, LOAD_INVITE_TYPE, REMOVED_INVITE_TYPE } from '../actions'
import { InviteResult } from '@xrengine/common/src/interfaces/InviteResult'

export interface InviteTypeCreatedAction {
  type: string
}

export interface InviteTypeRemoveAction {
  type: string
}

export interface InvitesTypesRetrievedAction {
  type: string
  total: number
  limit: number
  skip: number
  invitesType: any
}

export type InviteTypeAction = InviteTypeCreatedAction | InviteTypeRemoveAction | InvitesTypesRetrievedAction

export function retrievedInvitesTypes(inviteType: InviteResult): InvitesTypesRetrievedAction {
  return {
    type: LOAD_INVITE_TYPE,
    total: inviteType.total,
    limit: inviteType.limit,
    invitesType: inviteType.data,
    skip: inviteType.skip
  }
}

export function fetchingInvitesTypes(): InviteTypeAction {
  return {
    type: FETCHING_RECEIVED_INVITES_TYPES
  }
}
