import { useHistory } from 'react-router-dom'

import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { getPortalDetails } from '@xrengine/client-core/src/world/functions/getPortalDetails'
import { SceneData } from '@xrengine/common/src/interfaces/SceneInterface'
import multiLogger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  initializeCoreSystems,
  initializeRealtimeSystems,
  initializeSceneSystems
} from '@xrengine/engine/src/initializeEngine'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'
import { getSystemsFromSceneData } from '@xrengine/projects/loadSystemInjection'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:world' })

export const retrieveLocationByName = (locationName: string, userId: string) => {
  if (locationName === globalThis.process.env['VITE_LOBBY_LOCATION_NAME']) {
    const history = useHistory()
    LocationService.getLobby()
      .then((lobby) => {
        history.replace('/location/' + lobby?.slugifiedName)
      })
      .catch((err) => logger.error(err, 'getLobby'))
  } else {
    LocationService.getLocationByName(locationName, userId)
  }
}

export const initClient = async () => {
  const world = Engine.instance.currentWorld
  const projects = API.instance.client.service('projects').find()

  await initializeCoreSystems()
  await initializeRealtimeSystems()
  await initializeSceneSystems()
  await loadEngineInjection(world, await projects)
}

export const loadScene = async (sceneData: SceneData) => {
  const sceneSystems = getSystemsFromSceneData(sceneData.project, sceneData.scene, true)
  await loadSceneFromJSON(sceneData.scene, sceneSystems)
  getPortalDetails()
}
