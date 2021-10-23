import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { RelationshipSeed } from '@xrengine/common/src/interfaces/Relationship'
import { User } from '@xrengine/common/src/interfaces/User'
import { store } from '../../store'
import { UserActionType } from './UserAction'

const state = createState({
  relationship: RelationshipSeed,
  users: [] as Array<User>,
  updateNeeded: true,
  layerUsers: [] as Array<User>,
  layerUsersUpdateNeeded: true,
  channelLayerUsers: [] as Array<User>,
  channelLayerUsersUpdateNeeded: true,
  toastMessages: [] as Array<{ user: User; userAdded?: boolean; userRemoved?: boolean }>
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
          s.layerUsers.merge([newUser])
        } else {
          s.layerUsers[idx].set(newUser)
        }
        return s.layerUsersUpdateNeeded.set(true)
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
          s.channelLayerUsers.merge([newUser])
        } else {
          s.channelLayerUsers[idx].set(newUser)
        }
        return s.channelLayerUsersUpdateNeeded.set(true)
      }
      case 'REMOVED_CHANNEL_LAYER_USER':
        const newUser = action.user
        const idx = s.channelLayerUsers.findIndex((layerUser) => {
          return layerUser != null && layerUser.value.id === newUser.id
        })
        return s.channelLayerUsers[idx].set(none)
      case 'USER_TOAST':
        return s.toastMessages.merge([action.message])
    }
  }, action.type)
})

export const accessUserState = () => state
export const useUserState = () => useState(state) as any as typeof state as unknown as typeof state
