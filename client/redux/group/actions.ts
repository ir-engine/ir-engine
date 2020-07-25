import {
  ADDED_GROUP,
  PATCHED_GROUP,
  LOADED_GROUPS,
  REMOVED_GROUP,
  LEFT_GROUP,
  INVITED_GROUP_USER,
  REMOVED_GROUP_USER,
  FETCHING_GROUPS,
  LOADED_INVITABLE_GROUPS,
  FETCHING_INVITABLE_GROUPS
} from '../actions'
import { Group } from '../../../shared/interfaces/Group'
import { GroupResult } from '../../../shared/interfaces/GroupResult'

export interface LoadedGroupsAction {
  type: string
  groups: Group[],
  total: number,
  limit: number
  skip: number
}

export interface AddedGroupAction {
  type: string
}

export interface PatchedGroupAction {
  type: string
}

export interface RemovedGroupAction {
  type: string
}

export interface RemovedGroupUserAction {
  type: string
}

export interface InvitedGroupUserAction {
  type: string
}

export interface LeftGroupAction {
  type: string
}

export interface FetchingGroupsAction {
  type: string
}

export interface LoadedInvitableGroupsAction {
  type: string
  groups: Group[],
  total: number,
  limit: number
  skip: number
}

export interface FetchingInvitableGroupsAction {
  type: string
}

export type GroupAction =
    LoadedGroupsAction
    | AddedGroupAction
    | PatchedGroupAction
    | RemovedGroupAction
    | LeftGroupAction
    | LeftGroupAction
    | FetchingGroupsAction
    | LoadedInvitableGroupsAction
    | FetchingInvitableGroupsAction

export function loadedGroups(groupResult: GroupResult): GroupAction {
  return {
    type: LOADED_GROUPS,
    groups: groupResult.data,
    total: groupResult.total,
    limit: groupResult.limit,
    skip: groupResult.skip
  }
}

export function addedGroup(): AddedGroupAction {
  return {
    type: ADDED_GROUP
  }
}

export function patchedGroup(): PatchedGroupAction {
  return {
    type: PATCHED_GROUP
  }
}

export function removedGroup(): RemovedGroupAction {
  return {
    type: REMOVED_GROUP
  }
}

export function removedGroupUser(): RemovedGroupUserAction {
  return {
    type: REMOVED_GROUP_USER
  }
}

export function invitedGroupUser(): InvitedGroupUserAction {
  return {
    type: INVITED_GROUP_USER
  }
}

export function leftGroup(): LeftGroupAction {
  return {
    type: LEFT_GROUP
  }
}

export function fetchingGroups(): FetchingGroupsAction {
  return {
    type: FETCHING_GROUPS
  }
}

export function loadedInvitableGroups(groupResult: GroupResult): GroupAction {
  return {
    type: LOADED_INVITABLE_GROUPS,
    groups: groupResult.data,
    total: groupResult.total,
    limit: groupResult.limit,
    skip: groupResult.skip
  }
}

export function fetchingInvitableGroups(): FetchingInvitableGroupsAction {
  return {
    type: FETCHING_INVITABLE_GROUPS
  }
}