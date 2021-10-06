import { createState, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { ADMIN_SCENES_RETRIEVED } from '../../actions'
import { SceneActionType } from './SceneActions'

export const SCENE_PAGE_LIMIT = 100

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
    limit: SCENE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
})

export const adminSceneReducer = (_, action: SceneActionType) => {
  Promise.resolve().then(() => sceneReceptor(action))
  return state.attach(Downgraded).value
}

const sceneReceptor = (action: SceneActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case ADMIN_SCENES_RETRIEVED:
        result = action.collections
        return s.scenes.merge({
          scenes: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: new Date()
        })
    }
  }, action.type)
}

export const accessSceneState = () => state
export const useSceneState = () => useState(state) as any as typeof state
