import { ADDED_LAYER_USER, CHANGED_RELATION, CLEAR_LAYER_USERS, LOADED_LAYER_USERS, LOADED_RELATIONSHIP, REMOVED_LAYER_USER, USER_TOAST } from '../../../common/reducers/actions';

import { ADMIN_LOADED_USERS } from '@xrengine/client-core/src/admin/reducers/actions';
import { USER_PATCHED } from '../../reducers/actions';
import { ADDED_CHANNEL_LAYER_USER, CLEAR_CHANNEL_LAYER_USERS, LOADED_CHANNEL_LAYER_USERS, REMOVED_CHANNEL_LAYER_USER } from '../../../world/reducers/actions';
import { Relationship } from '@xrengine/common/src/interfaces/Relationship';
import { User } from '@xrengine/common/src/interfaces/User';

export interface LoadedUserRelationshipAction {
  type: string;
  relationship: Relationship;
}
export interface UserCreatedAction {
  type: string,
  user: User
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

export interface UserToastAction {
  type: string;
  message: any;
}

export interface UserRemovedInstance {
  type: string;
  user: any
}

export type UserAction =
  LoadedUserRelationshipAction
  | LoadedUsersAction
  | LoadedLayerUsersAction
  | ClearLayersUsersAction


export function userPatched ( user: User ): UserCreatedAction {
  return {
    type: USER_PATCHED,
    user: user
  };
}

export function loadedUserRelationship(relationship: Relationship): LoadedUserRelationshipAction {
  return {
    type: LOADED_RELATIONSHIP,
    relationship
  };
}

export function loadedUsers(users: User[]): LoadedUsersAction {
  return {
    type: ADMIN_LOADED_USERS,
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

export function displayUserToast(user: User, args: any): UserToastAction {
  return {
    type: USER_TOAST,
    message: { user, args },
  };
}