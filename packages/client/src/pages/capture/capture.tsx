import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { API } from '@etherealengine/client-core/src/API'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import ClientNetworkingSystem from '@etherealengine/client-core/src/networking/ClientNetworkingSystem'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { SceneService } from '@etherealengine/client-core/src/world/services/SceneService'
import { MediaModule } from '@etherealengine/engine/src/audio/MediaModule'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { initSystems, SystemModuleType } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'
import { MotionCaptureModule } from '@etherealengine/engine/src/mocap/MotionCaptureModule'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'
import CaptureUI from '@etherealengine/ui/src/components/tailwind/Capture'

const networkingSystems = {
  uuid: 'ee.client.core.ClientNetworkingSystem',
  type: SystemUpdateType.POST_RENDER,
  systemLoader: () => Promise.resolve({ default: ClientNetworkingSystem })
} as SystemModuleType<any>

const systems = [...MediaModule(), ...MotionCaptureModule(), networkingSystems]

export const initializeEngineForRecorder = async () => {
  if (getMutableState(EngineState).isEngineInitialized.value) return

  const projects = API.instance.client.service('projects').find()

  await initSystems(systems)
  await loadEngineInjection(await projects)

  dispatchAction(EngineActions.initializeEngine({ initialised: true }))
  dispatchAction(EngineActions.sceneLoaded({}))
}

export const CaptureLocation = () => {
  const params = useParams()
  AuthService.useAPIListeners()
  SceneService.useAPIListeners()

  useLoadLocationScene()

  const locationName = params?.locationName as string

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName }))
    initializeEngineForRecorder()
  }, [])

  const engineState = useHookstate(getMutableState(EngineState))

  if (!engineState.isEngineInitialized.value && !engineState.connectedWorld.value) return <></>

  return <CaptureUI />
}

export default CaptureLocation
