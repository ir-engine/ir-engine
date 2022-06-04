import { useState } from '@speigg/hookstate'

import { SceneData } from '@xrengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import {
  addActionReceptor,
  defineAction,
  defineState,
  dispatchAction,
  getState,
  registerState
} from '@xrengine/hyperflux'

import { client } from '../../feathers'

const state = defineState({
  name: 'SceneState',
  initial: () => ({
    currentScene: null as SceneData | null
  })
})

export const registerSceneServiceActions = () => {
  registerState(state)

  addActionReceptor(function SceneServiceReceptor(action) {
    getState(state).batch((s) => {
      matches(action).when(SceneAction.currentSceneChangedAction.matches, (action) => {
        return s.merge({
          currentScene: action.sceneData
        })
      })
    })
  })
}

registerSceneServiceActions()

export const accessSceneState = () => getState(state)

export const useSceneState = () => useState(accessSceneState())

export const SceneService = {
  fetchCurrentScene: async (projectName: string, sceneName: string) => {
    const sceneData = await client.service('scene').get({ projectName, sceneName, metadataOnly: null }, {})
    dispatchAction(SceneAction.currentSceneChangedAction({ sceneData: sceneData.data }))
  }
}

export class SceneAction {
  static currentSceneChangedAction = defineAction({
    store: 'ENGINE',
    type: 'location.CURRENT_SCENE_CHANGED',
    sceneData: matches.object as Validator<unknown, SceneData | null>
  })
}
