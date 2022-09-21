import { useEffect } from 'react'

import { SceneData } from '@xrengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { updateSceneFromJSON } from '@xrengine/engine/src/scene/systems/SceneLoadingSystem'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { accessLocationState } from '../../social/services/LocationService'

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    currentScene: null as SceneData | null
  })
})

export const SceneServiceReceptor = (action) => {
  const s = getState(SceneState)
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
}

export const accessSceneState = () => getState(SceneState)

export const useSceneState = () => useState(accessSceneState())

export const SceneService = {
  fetchCurrentScene: async (projectName: string, sceneName: string) => {
    const sceneData = await API.instance.client.service('scene').get({ projectName, sceneName, metadataOnly: null }, {})
    dispatchAction(SceneActions.currentSceneChanged({ sceneData: sceneData.data }))
  },

  useAPIListeners: () => {
    useEffect(() => {
      const sceneUpdatedListener = async () => {
        const locationState = accessLocationState()
        const [projectName, sceneName] = locationState.currentLocation.location.sceneId.value.split('/')
        const sceneData = await API.instance.client
          .service('scene')
          .get({ projectName, sceneName, metadataOnly: null }, {})
        updateSceneFromJSON(sceneData.data)
        ;(getState(SceneState).currentScene as any).scene.set(sceneData.data.scene)
      }
      // for testing
      // window.addEventListener('keydown', (ev) => {
      //   if (ev.code === 'KeyN') sceneUpdatedListener()
      // })

      /** @todo currently broken */
      API.instance.client.service('scene').on('updated', sceneUpdatedListener)

      return () => {
        API.instance.client.service('scene').off('updated', sceneUpdatedListener)
      }
    }, [])
  }
}

export class SceneActions {
  static currentSceneChanged = defineAction({
    type: 'xre.client.Scene.CURRENT_SCENE_CHANGED',
    sceneData: matches.object as Validator<unknown, SceneData>
  })

  static unloadCurrentScene = defineAction({
    type: 'xre.client.Scene.UNLOAD_CURRENT_SCENE'
  })
}
