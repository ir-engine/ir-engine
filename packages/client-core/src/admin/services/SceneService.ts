import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { SceneData } from '@xrengine/common/src/interfaces/SceneData'
import { SceneDataResult } from '@xrengine/common/src/interfaces/SceneDataResult'

//State
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
        return s.merge({
          scenes: {
            scenes: result.data,
            skip: result.skip,
            limit: result.limit,
            total: result.total,
            retrieving: false,
            fetched: true,
            updateNeeded: false,
            lastFetched: Date.now()
          }
        })
    }
  }, action.type)
})

export const accessSceneState = () => state

export const useSceneState = () => useState(state) as any as typeof state

//Service
export const SceneService = {
  fetchAdminScenes: async (incDec?: 'increment' | 'decrement' | 'all') => {
    const dispatch = useDispatch()
    const adminScene = accessSceneState()
    const skip = adminScene.scenes.skip.value
    const limit = adminScene.scenes.limit.value
    const scenes = await client.service('collection').find({
      query: {
        $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
        $limit: incDec === 'all' ? 1000 : limit,
        $sort: {
          name: 1
        }
      }
    })
    dispatch(SceneAction.collectionsFetched(scenes))
  },
  deleteScene: async (sceneId: string) => { }
}

//Action
export const SceneAction = {
  collectionsFetched: (sceneDataResult: SceneDataResult) => {
    return {
      type: 'ADMIN_SCENES_RETRIEVED',
      sceneDataResult: sceneDataResult
    }
  }
}

export type SceneActionType = ReturnType<typeof SceneAction[keyof typeof SceneAction]>
