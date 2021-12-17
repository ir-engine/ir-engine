import { Relationship } from '@xrengine/common/src/interfaces/Relationship'
import { User } from '@xrengine/common/src/interfaces/User'
import { useDispatch, store } from '../../store'
import { client } from '../../feathers'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { RelationshipSeed } from '@xrengine/common/src/interfaces/Relationship'

//State
const state = createState({
  relationship: RelationshipSeed,
  users: [] as Array<User>,
  updateNeeded: true,
  layerUsers: [] as Array<User>,
  layerUsersUpdateNeeded: true,
  channelLayerUsers: [] as Array<User>,
  channelLayerUsersUpdateNeeded: true,
  toastMessages: [] as Array<{ user: User; userAdded?: boolean; userRemoved?: boolean }>,
  selectedLayerUser: ''
})

store.receptors.push((action: UserActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOADED_RELATIONSHIP':
        return s.merge({ relationship: action.relationship, updateNeeded: false })
      case 'ADMIN_LOADED_USERS':
        return s.merge({ users: action.users, updateNeeded: false })
      case 'CHANGED_RELATION':
        return s.updateNeeded.set(true)
      case 'CLEAR_LAYER_USERS':
        return s.merge({ layerUsers: [], layerUsersUpdateNeeded: true })
      case 'LOADED_LAYER_USERS':
        return s.merge({ layerUsers: action.users, layerUsersUpdateNeeded: false })
      case 'ADDED_LAYER_USER': {
        const newUser = action.user
        const idx = s.layerUsers.findIndex((layerUser) => {
          return layerUser != null && layerUser.id.value === newUser.id
        })
        if (idx === -1) {
          return s.layerUsers.merge([newUser])
        } else {
          return s.layerUsers[idx].set(newUser)
        }
      }
      case 'REMOVED_LAYER_USER': {
        const layerUsers = s.layerUsers
        const idx = layerUsers.findIndex((layerUser) => {
          return layerUser != null && layerUser.value.id === action.user.id
        })
        return s.layerUsers[idx].set(none)
      }
      case 'CLEAR_CHANNEL_LAYER_USERS':
        return s.merge({
          channelLayerUsers: [],
          channelLayerUsersUpdateNeeded: true
        })
      case 'LOADED_CHANNEL_LAYER_USERS':
        return s.merge({
          channelLayerUsers: action.users,
          channelLayerUsersUpdateNeeded: false
        })
      case 'ADDED_CHANNEL_LAYER_USER': {
        const newUser = action.user
        const idx = s.channelLayerUsers.findIndex((layerUser) => {
          return layerUser != null && layerUser.value.id === newUser.id
        })
        if (idx === -1) {
          return s.channelLayerUsers.merge([newUser])
        } else {
          return s.channelLayerUsers[idx].set(newUser)
        }
      }
      case 'REMOVED_CHANNEL_LAYER_USER':
        const newUser = action.user
        if (newUser) {
          const idx = s.channelLayerUsers.findIndex((layerUser) => {
            return layerUser != null && layerUser.value.id === newUser.id
          })
          return s.channelLayerUsers[idx].set(none)
        } else return s
      case 'USER_TOAST':
        return s.toastMessages.merge([action.message])
      case 'SELECTED_LAYER_USER':
        return s.selectedLayerUser.set(action.userId)
    }
  }, action.type)
})

export const accessUserState = () => state
export const useUserState = () => useState(state) as any as typeof state as unknown as typeof state

//Service
export const UserService = {
  getUserRelationship: async (userId: string) => {
    const dispatch = useDispatch()
    {
      client
        .service('user-relationship')
        .findAll({
          query: {
            userId
          }
        })
        .then((res: any) => {
          dispatch(UserAction.loadedUserRelationship(res as Relationship))
        })
        .catch((err: any) => {
          console.log(err)
        })
    }
  },

  getLayerUsers: async (instance = true) => {
    const dispatch = useDispatch()
    {
      const layerUsers = await client.service('user').find({
        query: {
          $limit: 1000,
          action: instance ? 'layer-users' : 'channel-users'
        }
      })
      dispatch(
        instance ? UserAction.loadedLayerUsers(layerUsers.data) : UserAction.loadedChannelLayerUsers(layerUsers.data)
      )
    }
  },

  requestFriend: (userId: string, relatedUserId: string) => {
    return createRelation(userId, relatedUserId, 'friend')
  },

  blockUser: (userId: string, relatedUserId: string) => {
    return createRelation(userId, relatedUserId, 'blocking')
  },

  acceptFriend: (userId: string, relatedUserId: string) => {
    return patchRelation(userId, relatedUserId, 'friend')
  },

  declineFriend: (userId: string, relatedUserId: string) => {
    return removeRelation(userId, relatedUserId)
  },

  cancelBlock: (userId: string, relatedUserId: string) => {
    return removeRelation(userId, relatedUserId)
  },

  showUserToast: (user: User, args: string) => {
    return UserAction.displayUserToast(user, args)
  }
}

function createRelation(userId: string, relatedUserId: string, type: 'friend' | 'blocking') {
  const dispatch = useDispatch()
  {
    client
      .service('user-relationship')
      .create({
        relatedUserId,
        userRelationshipType: type
      })
      .then((res: any) => {
        dispatch(UserAction.changedRelation())
      })
      .catch((err: any) => {
        console.log(err)
      })
  }
}

function removeRelation(userId: string, relatedUserId: string) {
  const dispatch = useDispatch()
  {
    client
      .service('user-relationship')
      .remove(relatedUserId)
      .then((res: any) => {
        dispatch(UserAction.changedRelation())
      })
      .catch((err: any) => {
        console.log(err)
      })
  }
}

function patchRelation(userId: string, relatedUserId: string, type: 'friend') {
  const dispatch = useDispatch()
  {
    client
      .service('user-relationship')
      .patch(relatedUserId, {
        userRelationshipType: type
      })
      .then((res: any) => {
        dispatch(UserAction.changedRelation())
      })
      .catch((err: any) => {
        console.log(err)
      })
  }
}

//Action
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
  },

  selectedLayerUser: (userId: string) => {
    return {
      type: 'SELECTED_LAYER_USER' as const,
      userId: userId
    }
  }
}

export type UserActionType = ReturnType<typeof UserAction[keyof typeof UserAction]>
