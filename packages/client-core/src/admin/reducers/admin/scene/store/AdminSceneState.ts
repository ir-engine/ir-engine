import { createState, useState, Downgraded } from '@hookstate/core'
import { CollectionsFetchedAction } from '@xrengine/common/src/interfaces/Scene'
import { SceneActionType } from '../../../../../world/store/SceneAction'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'

export const PAGE_LIMIT = 100

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  scenes: {
    scenes: [],
    skip: 0,
    limit: 1000,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
})

export const AdminSceneReducer = (_, action: SceneActionType) => {
  Promise.resolve().then(() => AdminSceneReceptor(action))
  return state.attach(Downgraded).value
}

export const AdminSceneReceptor = (action: SceneActionType): void => {
  let result: any, updateMap: any
  state.batch((s) => {
    switch (action.type) {
      case 'SCENES_RETRIEVED':
        result = (action as CollectionsFetchedAction).collections
        updateMap = state.nested('scenes')
        updateMap.set('scenes', (result as any).data)
        updateMap.set('skip', (result as any).skip)
        updateMap.set('limit', (result as any).limit)
        updateMap.set('total', (result as any).total)
        updateMap.set('retrieving', false)
        updateMap.set('fetched', true)
        updateMap.set('updateNeeded', false)
        updateMap.set('lastFetched', new Date())
        return state.merge({ scenes: updateMap })
    }
  }, action.type)
}

export const accessAdminSceneState = () => state
export const useAdminSceneState = () => useState(state)
