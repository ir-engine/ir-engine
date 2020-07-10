import {
  LOADED_FRIENDS,
  REMOVED_FRIEND
} from '../actions'
import { User } from '../../../shared/interfaces/User'

export interface LoadedFriendsAction {
  type: string
  friends: User[]
}

export interface RemovedFriendAction {
  type: string
}

export type FriendAction =
    LoadedFriendsAction
    | RemovedFriendAction

export function loadedFriends(friends: User[]): LoadedFriendsAction {
  return {
    type: LOADED_FRIENDS,
    friends
  }
}

export function unfriended(): RemovedFriendAction {
  return {
    type: REMOVED_FRIEND
  }
}