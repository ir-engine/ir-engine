import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { SceneActionType } from './SceneActions'
import { SceneData } from '@xrengine/common/src/interfaces/SceneData'
import { store } from '../../store'

export const SCENE_PAGE_LIMIT = 100

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  scenes: {
    scenes: [] as Array<SceneData>,
    skip: 0,
    limit: SCENE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  }
})

store.receptors.push((action: SceneActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_SCENES_RETRIEVED':
        result = action.sceneDataResult
        return s.scenes.merge({
          scenes: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
    }
  }, action.type)
})

export const accessSceneState = () => state

export const useSceneState = () => useState(state) as any as typeof state
