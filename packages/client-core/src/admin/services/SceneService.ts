import { SceneMetadata } from '@xrengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { client } from '../../feathers'

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
    lastFetched: Date.now()
  })
})

export const AdminSceneServiceReceptor = (action) => {
  getState(AdminSceneState).batch((s) => {
    matches(action).when(AdminSceneActions.scenesFetched.matches, (action) => {
      return s.merge({
        scenes: action.sceneData,
        retrieving: false,
        fetched: true,
        updateNeeded: false,
        lastFetched: Date.now()
      })
    })
  })
}

export const accessAdminSceneState = () => getState(AdminSceneState)

export const useAdminSceneState = () => useState(accessAdminSceneState())

export const AdminSceneService = {
  fetchAdminScenes: async (incDec?: 'increment' | 'decrement' | 'all') => {
    const scenes = await client.service('scene').find()
    dispatchAction(AdminSceneActions.scenesFetched({ sceneData: scenes.data }))
  }
}

//Action
export class AdminSceneActions {
  static scenesFetched = defineAction({
    type: 'ADMIN_SCENES_RETRIEVED' as const,
    sceneData: matches.array as Validator<unknown, SceneMetadata[]>
  })
}
