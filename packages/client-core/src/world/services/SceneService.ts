import { SceneData } from '@xrengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { addActionReceptor, defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { client } from '../../feathers'

const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    currentScene: null as SceneData | null
  })
})

export const SceneServiceReceptor = (action) => {
  getState(SceneState).batch((s) => {
    matches(action).when(SceneAction.currentSceneChangedAction.matches, (action) => {
      return s.merge({
        currentScene: action.sceneData
      })
    })
  })
}

// addActionReceptor(SceneServiceReceptor)

export const accessSceneState = () => getState(SceneState)

export const useSceneState = () => useState(accessSceneState())

export const SceneService = {
  fetchCurrentScene: async (projectName: string, sceneName: string) => {
    const sceneData = await client.service('scene').get({ projectName, sceneName, metadataOnly: null }, {})
    // It should dispatch scene data

    dispatchAction(SceneAction.currentSceneChangedAction({ sceneData: sceneData.data }))
  }
}

export class SceneAction {
  static currentSceneChangedAction = defineAction({
    type: 'location.CURRENT_SCENE_CHANGED',
    sceneData: matches.object as Validator<unknown, SceneData | null>
  })
}
