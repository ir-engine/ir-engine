import {
  FETCHING_GROUP_USERS,
  FETCHING_SELF_GROUP_USER,
  LOADED_GROUP_USERS,
  LOADED_SELF_GROUP_USER,
  REMOVED_GROUP_USER
} from '../actions'
import { GroupUser } from '../../../shared/interfaces/GroupUser'
import { GroupUserResult } from '../../../shared/interfaces/GroupUserResult'

export interface LoadedSelfGroupUserAction {
  type: string
  selfGroupUser: GroupUser,
  total: number
}

export interface LoadedGroupUsersAction {
  type: string
  groupUsers: GroupUser[],
  total: number,
  limit: number
  skip: number
}

export interface RemovedGroupUserAction {
  type: string
}

export interface FetchingGroupUsersAction {
  type: string
}

export interface FetchingSelfGroupUserAction {
  type: string
}

export type GroupUserAction =
    LoadedGroupUsersAction
    | RemovedGroupUserAction
    | LoadedSelfGroupUserAction
    | FetchingGroupUsersAction
    | FetchingSelfGroupUserAction

export function loadedGroupUsers(groupUserResult: GroupUserResult): GroupUserAction {
  return {
    type: LOADED_GROUP_USERS,
    groupUsers: groupUserResult.data,
    total: groupUserResult.total,
    limit: groupUserResult.limit,
    skip: groupUserResult.skip
  }
}

export function loadedSelfGroupUser(groupUserResult: GroupUserResult): GroupUserAction {
  return {
    type: LOADED_SELF_GROUP_USER,
    selfGroupUser: groupUserResult.data[0],
    total: groupUserResult.total
  }
}

export function removedGroupUser(): RemovedGroupUserAction {
  return {
    type: REMOVED_GROUP_USER
  }
}

export function fetchingGroupUsers(): FetchingGroupUsersAction {
  return {
    type: FETCHING_GROUP_USERS
  }
}

export function fetchingSelfGroupUser(): FetchingSelfGroupUserAction {
  return {
    type: FETCHING_SELF_GROUP_USER
  }
}
