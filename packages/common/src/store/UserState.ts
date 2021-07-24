import { createState, useState, none } from '@hookstate/core'
import { RelationshipSeed } from '../interfaces/Relationship'
import { User } from '../interfaces/User'
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

export const userReceptor = (action: UserActionType): void => {
  switch (action.type) {
    case 'LOADED_RELATIONSHIP':
      return state.merge({ relationship: action.relationship, updateNeeded: false })
    case 'ADMIN_LOADED_USERS':
      return state.merge({ users: action.users, updateNeeded: false })
    case 'CHANGED_RELATION':
      return state.updateNeeded.set(true)
    case 'CLEAR_LAYER_USERS':
      return state.merge({ layerUsers: [], layerUsersUpdateNeeded: true })
    case 'LOADED_LAYER_USERS':
      return state.merge({ layerUsers: action.users, layerUsersUpdateNeeded: false })
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
      return state.layerUsersUpdateNeeded.set(true)
    }
    case 'REMOVED_LAYER_USER': {
      const layerUsers = state.layerUsers
      const idx = layerUsers.findIndex((layerUser) => {
        return layerUser != null && layerUser.value.id !== action.user.id
      })
      return state.layerUsers[idx].set(none)
    }
    case 'CLEAR_CHANNEL_LAYER_USERS':
      return state.merge({
        channelLayerUsers: [],
        channelLayerUsersUpdateNeeded: true
      })
    case 'LOADED_CHANNEL_LAYER_USERS':
      return state.merge({
        channelLayerUsers: action.users,
        channelLayerUsersUpdateNeeded: false
      })
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
      return state.channelLayerUsersUpdateNeeded.set(true)
    }
    case 'REMOVED_CHANNEL_LAYER_USER':
      const newUser = action.user
      const idx = state.channelLayerUsers.findIndex((layerUser) => {
        return layerUser != null && layerUser.value.id !== newUser.id
      })
      return state.channelLayerUsers[idx].set(none)
    case 'USER_TOAST':
      return state.toastMessages.merge([action.message])
  }
}

export const accessUserState = () => state
export const useUserState = () => useState(state)
