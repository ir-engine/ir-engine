import { User } from '@xrengine/common/src/interfaces/User'
import { UserRelationship } from '@xrengine/common/src/interfaces/UserRelationship'
import { FriendResult } from '@xrengine/common/src/interfaces/FriendResult'

export const FriendAction = {
  loadedFriends: (friendResult: FriendResult) => {
    return {
      type: 'LOADED_FRIENDS' as const,
      friends: friendResult.data,
      total: friendResult.total,
      limit: friendResult.limit,
      skip: friendResult.skip
    }
  },
  createdFriend: (userRelationship: UserRelationship) => {
    return {
      type: 'CREATED_FRIEND' as const,
      userRelationship: userRelationship
    }
  },
  patchedFriend: (userRelationship: UserRelationship, selfUser: User) => {
    return {
      type: 'PATCHED_FRIEND' as const,
      userRelationship: userRelationship,
      selfUser: selfUser
    }
  },
  removedFriend: (userRelationship: UserRelationship, selfUser: User) => {
    return {
      type: 'REMOVED_FRIEND' as const,
      userRelationship: userRelationship,
      selfUser: selfUser
    }
  },
  fetchingFriends: () => {
    return {
      type: 'FETCHING_FRIENDS' as const
    }
  }
}

export type FriendActionType = ReturnType<typeof FriendAction[keyof typeof FriendAction]>
