import {
  ADDED_LAYER_USER,
  CHANGED_RELATION,
  CLEAR_LAYER_USERS,
  LOADED_LAYER_USERS,
  LOADED_RELATIONSHIP,
  LOADED_USERS,
  REMOVED_LAYER_USER,
  ADDED_CHANNEL_LAYER_USER,
  CLEAR_CHANNEL_LAYER_USERS,
  LOADED_CHANNEL_LAYER_USERS,
  REMOVED_CHANNEL_LAYER_USER
} from '../actions';
import { Relationship } from '@xr3ngine/common/interfaces/Relationship';
import { User } from '@xr3ngine/common/interfaces/User';

export interface LoadedUserRelationshipAction {
  type: string;
  relationship: Relationship;
}

export interface LoadedUsersAction {
  type: string;
  users: User[];
}

export interface ChangedRelationAction {
  type: string;
}

export interface LoadedLayerUsersAction {
  type: string;
  users: User[];
}

export interface ClearLayersUsersAction {
  type: string;
}

export interface AddedLayerUserAction {
  type: string;
  user: User;
}

export interface RemovedLayerUserAction {
  type: string;
  user: User;
}

export type UserAction =
  LoadedUserRelationshipAction
  | LoadedUsersAction
  | LoadedLayerUsersAction
  | ClearLayersUsersAction

export function loadedUserRelationship(relationship: Relationship): LoadedUserRelationshipAction {
  return {
    type: LOADED_RELATIONSHIP,
    relationship
  };
}

export function loadedUsers(users: User[]): LoadedUsersAction {
  return {
    type: LOADED_USERS,
    users
  };
}

export function changedRelation(): ChangedRelationAction {
  return {
    type: CHANGED_RELATION
  };
}

export function loadedLayerUsers(users: User[]): LoadedLayerUsersAction {
  return {
    type: LOADED_LAYER_USERS,
    users: users
  };
}

export function clearLayerUsers(): ClearLayersUsersAction {
  return {
    type: CLEAR_LAYER_USERS
  };
}

export function addedLayerUser(user: User): AddedLayerUserAction {
  return {
    type: ADDED_LAYER_USER,
    user: user
  };
}

export function removedLayerUser(user: User): RemovedLayerUserAction {
  return {
    type: REMOVED_LAYER_USER,
    user: user
  };
}

export function loadedChannelLayerUsers(users: User[]): LoadedLayerUsersAction {
  return {
    type: LOADED_CHANNEL_LAYER_USERS,
    users: users
  };
}

export function clearChannelLayerUsers(): ClearLayersUsersAction {
  return {
    type: CLEAR_CHANNEL_LAYER_USERS
  };
}

export function addedChannelLayerUser(user: User): AddedLayerUserAction {
  return {
    type: ADDED_CHANNEL_LAYER_USER,
    user: user
  };
}

export function removedChannelLayerUser(user: User): RemovedLayerUserAction {
  return {
    type: REMOVED_CHANNEL_LAYER_USER,
    user: user
  };
}