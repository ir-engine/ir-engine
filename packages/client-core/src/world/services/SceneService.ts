import { useEffect } from 'react'

import { SceneData } from '@xrengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { addActionReceptor, defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { loadScene } from '../../components/World/LocationLoadHelper'
import { accessLocationState } from '../../social/services/LocationService'

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
  },

  useAPIListeners: () => {
    useEffect(() => {
      const sceneUpdatedListener = async () => {
        const locationState = accessLocationState()
        const [projectName, sceneName] = locationState.currentLocation.location.sceneId.value.split('/')
        const sceneData = await API.instance.client
          .service('scene')
          .get({ projectName, sceneName, metadataOnly: null }, {})
        loadScene(sceneData.data)
      }
      // for testing
      // window.addEventListener('keydown', (ev) => {
      //   if(ev.code === 'KeyN') sceneUpdatedListener()
      // })

      API.instance.client.service('scene').on('updated', sceneUpdatedListener)

      return () => {
        API.instance.client.service('scene').off('updated', sceneUpdatedListener)
      }
    }, [])
  }
}

export class SceneActions {
  static currentSceneChanged = defineAction({
    type: 'location.CURRENT_SCENE_CHANGED',
    sceneData: matches.object as Validator<unknown, SceneData | null>
  })

  static unloadCurrentScene = defineAction({
    type: 'location.UNLOAD_CURRENT_SCENE'
  })
}
