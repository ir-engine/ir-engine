import { SceneData } from '@xrengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { addActionReceptor, defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    currentScene: null as SceneData | null
  })
})

export const SceneServiceReceptor = (action) => {
  getState(SceneState).batch((s) => {
    matches(action)
      .when(SceneActions.currentSceneChanged.matches, (action) => {
        return s.merge({
          currentScene: action.sceneData
        })
      })
      .when(SceneActions.unloadCurrentScene.matches, (action) => {
        return s.merge({
          currentScene: null
        })
      })
  })
}

export const accessSceneState = () => getState(SceneState)

export const useSceneState = () => useState(accessSceneState())

export const SceneService = {
  fetchCurrentScene: async (projectName: string, sceneName: string) => {
    const sceneData = await API.instance.client.service('scene').get({ projectName, sceneName, metadataOnly: null }, {})
    dispatchAction(SceneActions.currentSceneChanged({ sceneData: sceneData.data }))
  }
}

export class SceneActions {
  static currentSceneChanged = defineAction({
    type: 'location.CURRENT_SCENE_CHANGED',
    sceneData: (matches.object as Validator<unknown, SceneData>).optional()
  })

  static unloadCurrentScene = defineAction({
    type: 'location.UNLOAD_CURRENT_SCENE'
  })
}
