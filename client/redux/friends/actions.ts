import {
  LOADED_FRIENDS
} from '../actions'
import { Relationship } from '../../../shared/interfaces/Relationship'
import { User } from '../../../shared/interfaces/User'

export interface LoadedFriendsAction {
  type: string
  friends: User[]
}

export type FriendAction =
    LoadedFriendsAction

export function loadedFriends(friends: User[]): LoadedFriendsAction {
  return {
    type: LOADED_FRIENDS,
    friends
  }
}