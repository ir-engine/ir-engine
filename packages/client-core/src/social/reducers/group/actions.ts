import { Group } from '@xrengine/common/src/interfaces/Group'
import { GroupUser } from '@xrengine/common/src/interfaces/GroupUser'
import { GroupResult } from '@xrengine/common/src/interfaces/GroupResult'
import {
  LOADED_GROUPS,
  CREATED_GROUP,
  PATCHED_GROUP,
  REMOVED_GROUP,
  CREATED_GROUP_USER,
  PATCHED_GROUP_USER,
  REMOVED_GROUP_USER,
  INVITED_GROUP_USER,
  LEFT_GROUP,
  FETCHING_GROUPS,
  LOADED_INVITABLE_GROUPS,
  FETCHING_INVITABLE_GROUPS
} from '../actions'

export interface LoadedGroupsAction {
  type: string
  groups: Group[]
  total: number
  limit: number
  skip: number
}

export interface CreatedGroupAction {
  type: string
  group: Group
}

export interface PatchedGroupAction {
  type: string
  group: Group
}

export interface RemovedGroupAction {
  type: string
  group: Group
}

export interface CreatedGroupUserAction {
  type: string
  groupUser: GroupUser
}

export interface PatchedGroupUserAction {
  type: string
  groupUser: GroupUser
}

export interface RemovedGroupUserAction {
  type: string
  groupUser: GroupUser
  self: boolean
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
  groups: Group[]
  total: number
  limit: number
  skip: number
}

export interface FetchingInvitableGroupsAction {
  type: string
}

export type SocialGroupAction =
  | LoadedGroupsAction
  | CreatedGroupAction
  | PatchedGroupAction
  | RemovedGroupAction
  | LeftGroupAction
  | FetchingGroupsAction
  | LoadedInvitableGroupsAction
  | FetchingInvitableGroupsAction
  | CreatedGroupUserAction
  | PatchedGroupUserAction
  | RemovedGroupUserAction

export function loadedGroups(groupResult: GroupResult): SocialGroupAction {
  return {
    type: LOADED_GROUPS,
    groups: groupResult.data,
    total: groupResult.total,
    limit: groupResult.limit,
    skip: groupResult.skip
  }
}

export function createdGroup(group: Group): CreatedGroupAction {
  return {
    type: CREATED_GROUP,
    group: group
  }
}

export function patchedGroup(group: Group): PatchedGroupAction {
  return {
    type: PATCHED_GROUP,
    group: group
  }
}

export function removedGroup(group: Group): RemovedGroupAction {
  return {
    type: REMOVED_GROUP,
    group: group
  }
}

export function createdGroupUser(groupUser: GroupUser): CreatedGroupUserAction {
  return {
    type: CREATED_GROUP_USER,
    groupUser: groupUser
  }
}

export function patchedGroupUser(groupUser: GroupUser): PatchedGroupUserAction {
  return {
    type: PATCHED_GROUP_USER,
    groupUser: groupUser
  }
}

export function removedGroupUser(groupUser: GroupUser, self: boolean): RemovedGroupUserAction {
  return {
    type: REMOVED_GROUP_USER,
    groupUser: groupUser,
    self: self
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

export function loadedInvitableGroups(groupResult: GroupResult): SocialGroupAction {
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
