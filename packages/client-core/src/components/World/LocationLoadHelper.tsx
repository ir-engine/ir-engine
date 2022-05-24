import { useHistory } from 'react-router-dom'
import matches from 'ts-matches'

import { AppAction, GeneralStateList } from '@xrengine/client-core/src/common/services/AppService'
import { accessProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import { MediaStreamService } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { getPortalDetails } from '@xrengine/client-core/src/world/functions/getPortalDetails'
import { SceneData, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import multiLogger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import {
  initializeCoreSystems,
  initializeRealtimeSystems,
  initializeSceneSystems
} from '@xrengine/engine/src/initializeEngine'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { updateNearbyAvatars } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { addActionReceptor } from '@xrengine/hyperflux'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'
import { getSystemsFromSceneData } from '@xrengine/projects/loadSystemInjection'

const logger = multiLogger.child({ component: 'client-core:world' })

export const retrieveLocationByName = (locationName: string) => {
  if (locationName === globalThis.process.env['VITE_LOBBY_LOCATION_NAME']) {
    const history = useHistory()
    LocationService.getLobby()
      .then((lobby) => {
        history.replace('/location/' + lobby?.slugifiedName)
      })
      .catch((err) => logger.error(err, 'getLobby'))
  } else {
    LocationService.getLocationByName(locationName)
  }
}

export const initClient = async () => {
  const projects = accessProjectState().projects.value.map((project) => project.name)
  const world = Engine.instance.currentWorld

  await initializeCoreSystems()
  await initializeRealtimeSystems()
  await initializeSceneSystems()
  await loadEngineInjection(world, projects)

  // add extraneous receptors
  addActionReceptor(world.store, (action) => {
    matches(action)
      .when(NetworkWorldAction.createClient.matches, () => {
        updateNearbyAvatars()
        MediaStreamService.triggerUpdateNearbyLayerUsers()
      })
      .when(NetworkWorldAction.destroyClient.matches, () => {
        updateNearbyAvatars()
        MediaStreamService.triggerUpdateNearbyLayerUsers()
      })
  })
}

export const loadScene = (sceneData: SceneData) => {
  const dispatch = useDispatch()
  dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))
  const sceneSystems = getSystemsFromSceneData(sceneData.project, sceneData.scene, true)
  loadSceneFromJSON(sceneData.scene, sceneSystems).then(() => {
    getPortalDetails()
    dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
  })
}
