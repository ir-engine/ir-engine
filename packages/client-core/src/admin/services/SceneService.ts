import { SceneData, SceneMetadata } from '@xrengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

//State
export const SCENE_PAGE_LIMIT = 100

const AdminSceneState = defineState({
  name: 'AdminSceneState',
  initial: () => ({
    scenes: [] as Array<SceneMetadata>,
    skip: 0,
    limit: SCENE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now(),
    singleScene: { scene: {} } as SceneData
  })
})

const scenesFetchedReceptor = (action: typeof AdminSceneActions.scenesFetched.matches._TYPE) => {
  const state = getState(AdminSceneState)
  return state.merge({
    scenes: action.sceneData,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const sceneFetchedReceptor = (action: typeof AdminSceneActions.sceneFetched.matches._TYPE) => {
  const state = getState(AdminSceneState)
  return state.merge({
    singleScene: action.sceneData,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

export const AdminSceneReceptors = {
  scenesFetchedReceptor,
  sceneFetchedReceptor
}

export const accessAdminSceneState = () => getState(AdminSceneState)

export const useAdminSceneState = () => useState(accessAdminSceneState())

export const AdminSceneService = {
  fetchAdminScenes: async (incDec?: 'increment' | 'decrement' | 'all') => {
    const scenes = await API.instance.client.service('scene').find()
    dispatchAction(AdminSceneActions.scenesFetched({ sceneData: scenes.data }))
  },
  fetchAdminScene: async (projectName, sceneName) => {
    const scene = await API.instance.client.service('scene').get({ projectName, sceneName, metadataOnly: false })
    dispatchAction(AdminSceneActions.sceneFetched({ sceneData: scene.data }))
  }
}

//Action
export class AdminSceneActions {
  static scenesFetched = defineAction({
    type: 'xre.client.AdminScene.ADMIN_SCENES_RETRIEVED' as const,
    sceneData: matches.array as Validator<unknown, SceneMetadata[]>
  })

  static sceneFetched = defineAction({
    type: 'xre.client.AdminScene.ADMIN_SCENE_RETRIEVED' as const,
    sceneData: matches.object as Validator<unknown, SceneData>
  })
}
