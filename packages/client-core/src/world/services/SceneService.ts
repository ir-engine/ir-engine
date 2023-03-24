import { useEffect } from 'react'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { getMutableState } from '@etherealengine/hyperflux'

import { accessLocationState } from '../../social/services/LocationService'

export const SceneService = {
  fetchCurrentScene: async (projectName: string, sceneName: string) => {
    const sceneData = await Engine.instance.api.service('scene').get({ projectName, sceneName, metadataOnly: null }, {})
    getMutableState(SceneState).sceneData.set(sceneData.data)
    return sceneData
  },

  useAPIListeners: () => {
    useEffect(() => {
      const sceneUpdatedListener = async () => {
        const locationState = accessLocationState()
        const [projectName, sceneName] = locationState.currentLocation.location.sceneId.value.split('/')
        const sceneData = await Engine.instance.api
          .service('scene')
          .get({ projectName, sceneName, metadataOnly: null }, {})
        getMutableState(SceneState).sceneData.set(sceneData.data)
      }
      // for testing
      // window.addEventListener('keydown', (ev) => {
      //   if (ev.code === 'KeyN') sceneUpdatedListener()
      // })

      Engine.instance.api.service('scene').on('updated', sceneUpdatedListener)

      return () => {
        Engine.instance.api.service('scene').off('updated', sceneUpdatedListener)
      }
    }, [])
  }
}
