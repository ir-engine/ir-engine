import { Paginated } from '@feathersjs/feathers'
import { none, useState } from '@speigg/hookstate'

import { Relationship } from '@xrengine/common/src/interfaces/Relationship'
import { RelationshipSeed } from '@xrengine/common/src/interfaces/Relationship'
import { User } from '@xrengine/common/src/interfaces/User'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import {
  addActionReceptor,
  defineAction,
  defineState,
  dispatchAction,
  getState,
  registerState
} from '@xrengine/hyperflux'

import { client } from '../../feathers'

//State
const UserState = defineState({
  name: 'UserState',
  initial: () => ({
    relationship: RelationshipSeed,
    users: [] as Array<User>,
    updateNeeded: true,
    layerUsers: [] as Array<User>,
    layerUsersUpdateNeeded: true,
    channelLayerUsers: [] as Array<User>,
    channelLayerUsersUpdateNeeded: true
  })
})

export const registerUserServiceActions = () => {
  registerState(UserState)

  addActionReceptor(function UserServiceReceptor(action) {
    getState(UserState).batch((s) => {
      matches(action)
        .when(UserAction.loadedUserRelationshipAction.matches, (action) => {
          return s.merge({ relationship: action.relationship, updateNeeded: false })
        })
        .when(UserAction.loadedUsersAction.matches, (action) => {
          s.merge({ users: action.users, updateNeeded: false })
        })
        .when(UserAction.changedRelationAction.matches, () => {
          return s.updateNeeded.set(true)
        })
        .when(UserAction.clearLayerUsersAction.matches, () => {
          return s.merge({ layerUsers: [], layerUsersUpdateNeeded: true })
        })
        .when(UserAction.loadedLayerUsersAction.matches, (action) => {
          return s.merge({ layerUsers: action.users, layerUsersUpdateNeeded: false })
        })
        .when(UserAction.addedLayerUserAction.matches, (action) => {
          const newUser = action.user
          const idx = s.layerUsers.findIndex((layerUser) => {
            return layerUser != null && layerUser.id.value === newUser.id
          })
          if (idx === -1) {
            return s.layerUsers.merge([newUser])
          } else {
            return s.layerUsers[idx].set(newUser)
          }
        })
        .when(UserAction.removedLayerUserAction.matches, (action) => {
          const layerUsers = s.layerUsers
          const idx = layerUsers.findIndex((layerUser) => {
            return layerUser != null && layerUser.value.id === action.user.id
          })
          return s.layerUsers[idx].set(none)
        })
        .when(UserAction.clearChannelLayerUsersAction.matches, () => {
          return s.merge({
            channelLayerUsers: [],
            channelLayerUsersUpdateNeeded: true
          })
        })
        .when(UserAction.loadedChannelLayerUsersAction.matches, (action) => {
          return s.merge({
            channelLayerUsers: action.users,
            channelLayerUsersUpdateNeeded: false
          })
        })
        .when(UserAction.addedChannelLayerUserAction.matches, (action) => {
          const newUser = action.user
          const idx = s.channelLayerUsers.findIndex((layerUser) => {
            return layerUser != null && layerUser.value.id === newUser.id
          })
          if (idx === -1) {
            return s.channelLayerUsers.merge([newUser])
          } else {
            return s.channelLayerUsers[idx].set(newUser)
          }
        })
        .when(UserAction.removedChannelLayerUserAction.matches, (action) => {
          const newUser = action.user
          if (newUser) {
            const idx = s.channelLayerUsers.findIndex((layerUser) => {
              return layerUser != null && layerUser.value.id === newUser.id
            })
            return s.channelLayerUsers[idx].set(none)
          } else return s
        })
    })
  })
}

registerUserServiceActions()

export const accessUserState = () => getState(UserState)
export const useUserState = () => useState(accessUserState()) as any as typeof UserState as unknown as typeof UserState

//Service
export const UserService = {
  getUserRelationship: async (userId: string) => {
    client
      .service('user-relationship')
      .findAll({
        query: {
          userId
        }
      })
      .then((res: Relationship) => {
        dispatchAction(UserAction.loadedUserRelationshipAction({ relationship: res as Relationship }))
      })
      .catch((err: any) => {
        console.log(err)
      })
  },

  getLayerUsers: async (instance) => {
    const search = window.location.search
    let instanceId
    if (search != null) {
      const parsed = new URL(window.location.href).searchParams.get('instanceId')
      instanceId = parsed
    }
    const layerUsers = (await client.service('user').find({
      query: {
        $limit: 1000,
        action: instance ? 'layer-users' : 'channel-users',
        instanceId
      }
    })) as Paginated<User>
    dispatchAction(
      instance
        ? UserAction.loadedLayerUsersAction({ users: layerUsers.data })
        : UserAction.loadedChannelLayerUsersAction({ users: layerUsers.data })
    )
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
  }
}

function createRelation(userId: string, relatedUserId: string, type: 'friend' | 'blocking') {
  client
    .service('user-relationship')
    .create({
      relatedUserId,
      userRelationshipType: type
    })
    .then((res: any) => {
      dispatchAction(UserAction.changedRelationAction())
    })
    .catch((err: any) => {
      console.log(err)
    })
}

function removeRelation(userId: string, relatedUserId: string) {
  client
    .service('user-relationship')
    .remove(relatedUserId)
    .then((res: any) => {
      dispatchAction(UserAction.changedRelationAction())
    })
    .catch((err: any) => {
      console.log(err)
    })
}

function patchRelation(userId: string, relatedUserId: string, type: 'friend') {
  client
    .service('user-relationship')
    .patch(relatedUserId, {
      userRelationshipType: type
    })
    .then((res: any) => {
      dispatchAction(UserAction.changedRelationAction())
    })
    .catch((err: any) => {
      console.log(err)
    })
}

//Action
export class UserAction {
  static userPatchedAction = defineAction({
    store: 'ENGINE',
    type: 'USER_PATCHED' as const,
    user: matches.object
  })

  static loadedUserRelationshipAction = defineAction({
    store: 'ENGINE',
    type: 'LOADED_RELATIONSHIP' as const,
    relationship: matches.object as Validator<unknown, Relationship>
  })

  static loadedUsersAction = defineAction({
    store: 'ENGINE',
    type: 'ADMIN_LOADED_USERS' as const,
    users: matches.array as Validator<unknown, User[]>
  })

  static changedRelationAction = defineAction({
    store: 'ENGINE',
    type: 'CHANGED_RELATION' as const
  })

  static loadedLayerUsersAction = defineAction({
    store: 'ENGINE',
    type: 'LOADED_LAYER_USERS' as const,
    users: matches.array as Validator<unknown, User[]>
  })

  static clearLayerUsersAction = defineAction({
    store: 'ENGINE',
    type: 'CLEAR_LAYER_USERS' as const
  })

  static addedLayerUserAction = defineAction({
    store: 'ENGINE',
    type: 'ADDED_LAYER_USER' as const,
    user: matches.object as Validator<unknown, User>
  })

  static removedLayerUserAction = defineAction({
    store: 'ENGINE',
    type: 'REMOVED_LAYER_USER' as const,
    user: matches.object as Validator<unknown, User>
  })

  static loadedChannelLayerUsersAction = defineAction({
    store: 'ENGINE',
    type: 'LOADED_CHANNEL_LAYER_USERS' as const,
    users: matches.array as Validator<unknown, User[]>
  })

  static clearChannelLayerUsersAction = defineAction({
    store: 'ENGINE',
    type: 'CLEAR_CHANNEL_LAYER_USERS' as const
  })

  static addedChannelLayerUserAction = defineAction({
    store: 'ENGINE',
    type: 'ADDED_CHANNEL_LAYER_USER' as const,
    user: matches.object as Validator<unknown, User>
  })

  static removedChannelLayerUserAction = defineAction({
    store: 'ENGINE',
    type: 'REMOVED_CHANNEL_LAYER_USER' as const,
    user: matches.object as Validator<unknown, User>
  })
}
