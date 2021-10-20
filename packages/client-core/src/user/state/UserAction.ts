import { Relationship } from '@xrengine/common/src/interfaces/Relationship'
import { User } from '@xrengine/common/src/interfaces/User'

export const UserAction = {
  userPatched: (user: User) => {
    return {
      type: 'USER_PATCHED' as const,
      user: user
    }
  },

  loadedUserRelationship: (relationship: Relationship) => {
    return {
      type: 'LOADED_RELATIONSHIP' as const,
      relationship
    }
  },

  loadedUsers: (users: User[]) => {
    return {
      type: 'ADMIN_LOADED_USERS' as const,
      users
    }
  },

  changedRelation: () => {
    return {
      type: 'CHANGED_RELATION' as const
    }
  },

  loadedLayerUsers: (users: User[]) => {
    return {
      type: 'LOADED_LAYER_USERS' as const,
      users: users
    }
  },

  clearLayerUsers: () => {
    return {
      type: 'CLEAR_LAYER_USERS' as const
    }
  },

  addedLayerUser: (user: User) => {
    return {
      type: 'ADDED_LAYER_USER' as const,
      user: user
    }
  },

  removedLayerUser: (user: User) => {
    return {
      type: 'REMOVED_LAYER_USER' as const,
      user: user
    }
  },

  loadedChannelLayerUsers: (users: User[]) => {
    return {
      type: 'LOADED_CHANNEL_LAYER_USERS' as const,
      users: users
    }
  },

  clearChannelLayerUsers: () => {
    return {
      type: 'CLEAR_CHANNEL_LAYER_USERS' as const
    }
  },

  addedChannelLayerUser: (user: User) => {
    return {
      type: 'ADDED_CHANNEL_LAYER_USER' as const,
      user: user
    }
  },

  removedChannelLayerUser: (user: User) => {
    return {
      type: 'REMOVED_CHANNEL_LAYER_USER' as const,
      user: user
    }
  },

  displayUserToast: (user: User, args: any) => {
    return {
      type: 'USER_TOAST' as const,
      message: { user, args }
    }
  }
}

export type UserActionType = ReturnType<typeof UserAction[keyof typeof UserAction]>
