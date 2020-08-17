import {
  LOADED_RELATIONSHIP,
  LOADED_USERS,
  CHANGED_RELATION
} from '../actions'
import { Relationship } from '@xr3ngine/common/interfaces/Relationship'
import { User } from '@xr3ngine/common/interfaces/User'

export interface LoadedUserRelationshipAction {
  type: string
  relationship: Relationship
}

export interface LoadedUsersAction {
  type: string
  users: User[]
}

export interface ChangedRelationAction {
  type: string
}

export type UserAction =
  LoadedUserRelationshipAction
  | LoadedUsersAction

export function loadedUserRelationship(relationship: Relationship): LoadedUserRelationshipAction {
  return {
    type: LOADED_RELATIONSHIP,
    relationship
  }
}

export function loadedUsers(users: User[]): LoadedUsersAction {
  return {
    type: LOADED_USERS,
    users
  }
}

export function changedRelation(): ChangedRelationAction {
  return {
    type: CHANGED_RELATION
  }
}
