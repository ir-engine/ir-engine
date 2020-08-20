import {
  LOADED_FRIENDS,
  CREATED_FRIEND,
  PATCHED_FRIEND,
  REMOVED_FRIEND,
  FETCHING_FRIENDS
} from '../actions';
import { User } from '@xr3ngine/common/interfaces/User';
import { UserRelationship } from '@xr3ngine/common/interfaces/UserRelationship';
import { FriendResult } from '@xr3ngine/common/interfaces/FriendResult';

export interface LoadedFriendsAction {
  type: string;
  friends: User[];
  total: number;
  limit: number;
  skip: number;
}

export interface CreatedFriendAction {
  type: string;
  userRelationship: UserRelationship;
}

export interface PatchedFriendAction {
  type: string;
  userRelationship: UserRelationship;
  selfUser: User;
}

export interface RemovedFriendAction {
  type: string;
  userRelationship: UserRelationship;
  selfUser: User;
}

export interface FetchingFriendsAction {
  type: string;
}

export type FriendAction =
    LoadedFriendsAction
    | CreatedFriendAction
    | PatchedFriendAction
    | RemovedFriendAction
    | FetchingFriendsAction

export function loadedFriends(friendResult: FriendResult): FriendAction {
  return {
    type: LOADED_FRIENDS,
    friends: friendResult.data,
    total: friendResult.total,
    limit: friendResult.limit,
    skip: friendResult.skip
  };
}

export function createdFriend(userRelationship: UserRelationship): CreatedFriendAction {
  return {
    type: CREATED_FRIEND,
    userRelationship: userRelationship
  };
}

export function patchedFriend(userRelationship: UserRelationship, selfUser: User): PatchedFriendAction {
  return {
    type: PATCHED_FRIEND,
    userRelationship: userRelationship,
    selfUser: selfUser
  };
}

export function removedFriend(userRelationship: UserRelationship, selfUser: User): RemovedFriendAction {
  return {
    type: REMOVED_FRIEND,
    userRelationship: userRelationship,
    selfUser: selfUser
  };
}

export function fetchingFriends(): FriendAction {
  return {
    type: FETCHING_FRIENDS
  };
}