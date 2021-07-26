import { createState, useState, none } from '@hookstate/core'
import { RelationshipSeed } from '@xrengine/common/src/interfaces/Relationship'
import { User } from '@xrengine/common/src/interfaces/User'
import { UserActionType } from './UserAction'

const state = createState({
  relationship: RelationshipSeed,
  users: [] as Array<User>,
  updateNeeded: true,
  layerUsers: [] as Array<User>,
  layerUsersUpdateNeeded: true,
  channelLayerUsers: [] as Array<User>,
  channelLayerUsersUpdateNeeded: true,
  toastMessages: [] as Array<{ user: User; args: { userAdded?: boolean; userRemoved?: boolean } }>
})

export const userReceptor = (_, action: UserActionType): typeof state => {
  switch (action.type) {
    case 'LOADED_RELATIONSHIP':
      state.merge({ relationship: action.relationship, updateNeeded: false })
      return state
    case 'ADMIN_LOADED_USERS':
      state.merge({ users: action.users, updateNeeded: false })
      return state
    case 'CHANGED_RELATION':
      state.updateNeeded.set(true)
      return state
    case 'CLEAR_LAYER_USERS':
      state.merge({ layerUsers: [], layerUsersUpdateNeeded: true })
      return state
    case 'LOADED_LAYER_USERS':
      state.merge({ layerUsers: action.users, layerUsersUpdateNeeded: false })
      return state
    case 'ADDED_LAYER_USER': {
      const newUser = action.user
      const idx = state.layerUsers.findIndex((layerUser) => {
        return layerUser != null && layerUser.id.value === newUser.id
      })
      if (idx === -1) {
        state.layerUsers.merge([newUser])
      } else {
        state.layerUsers[idx].set(newUser)
      }
      state.layerUsersUpdateNeeded.set(true)
      return state
    }
    case 'REMOVED_LAYER_USER': {
      const layerUsers = state.layerUsers
      const idx = layerUsers.findIndex((layerUser) => {
        return layerUser != null && layerUser.value.id !== action.user.id
      })
      state.layerUsers[idx].set(none)
      return state
    }
    case 'CLEAR_CHANNEL_LAYER_USERS':
      state.merge({
        channelLayerUsers: [],
        channelLayerUsersUpdateNeeded: true
      })
      return state
    case 'LOADED_CHANNEL_LAYER_USERS':
      state.merge({
        channelLayerUsers: action.users,
        channelLayerUsersUpdateNeeded: false
      })
      return state
    case 'ADDED_CHANNEL_LAYER_USER': {
      const newUser = action.user
      const idx = state.channelLayerUsers.findIndex((layerUser) => {
        return layerUser != null && layerUser.value.id === newUser.id
      })
      if (idx === -1) {
        state.channelLayerUsers.merge([newUser])
      } else {
        state.channelLayerUsers[idx].set(newUser)
      }
      state.channelLayerUsersUpdateNeeded.set(true)
      return state
    }
    case 'REMOVED_CHANNEL_LAYER_USER':
      const newUser = action.user
      const idx = state.channelLayerUsers.findIndex((layerUser) => {
        return layerUser != null && layerUser.value.id !== newUser.id
      })
      state.channelLayerUsers[idx].set(none)
      return state
    case 'USER_TOAST':
      state.toastMessages.merge([action.message])
      return state
  }
}

export const accessUserState = () => state
export const useUserState = () => useState(state)
