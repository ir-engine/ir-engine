import {
  LOADED_FRIENDS,
  REMOVED_FRIEND
} from '../actions'
import { User } from '../../../shared/interfaces/User'
import { FriendResult } from '../../../shared/interfaces/FriendResult'

export interface LoadedFriendsAction {
  type: string
  friends: User[],
  total: number,
  limit: number
  skip: number
}

export interface RemovedFriendAction {
  type: string
}

export type FriendAction =
    LoadedFriendsAction
    | RemovedFriendAction

export function loadedFriends(friendResult: FriendResult): FriendAction {
  return {
    type: LOADED_FRIENDS,
    friends: friendResult.data,
    total: friendResult.total,
    limit: friendResult.limit,
    skip: friendResult.skip
  }
}

export function unfriended(): RemovedFriendAction {
  return {
    type: REMOVED_FRIEND
  }
}