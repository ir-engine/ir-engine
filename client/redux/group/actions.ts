import {
  ADDED_GROUP,
  UPDATED_GROUP,
  LOADED_GROUPS,
  REMOVED_GROUP,
  LEFT_GROUP,
  INVITED_GROUP_USER,
  REMOVED_GROUP_USER
} from '../actions'
import { Group } from '../../../shared/interfaces/Group'
import { GroupUser } from '../../../shared/interfaces/GroupUser'
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

export interface UpdatedGroupAction {
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

export type GroupAction =
    LoadedGroupsAction
    | AddedGroupAction
    | UpdatedGroupAction
    | RemovedGroupAction
    | LeftGroupAction
    | LeftGroupAction

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

export function updatedGroup(): UpdatedGroupAction {
  return {
    type: UPDATED_GROUP
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