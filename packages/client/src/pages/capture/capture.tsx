import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { API } from '@etherealengine/client-core/src/API'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { ClientNetworkingSystem } from '@etherealengine/client-core/src/networking/ClientNetworkingSystem'
import { RecordingServiceSystem } from '@etherealengine/client-core/src/recording/RecordingService'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { SceneService } from '@etherealengine/client-core/src/world/services/SceneService'
import { MediaSystem } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { InputSystemGroup, PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystem, startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { MotionCaptureSystem } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'
import CaptureUI from '@etherealengine/ui/src/components/tailwind/Capture'

const startCaptureSystems = () => {
  startSystem(MotionCaptureSystem, { with: InputSystemGroup })
  startSystem(MediaSystem, { before: PresentationSystemGroup })
  startSystems([ClientNetworkingSystem, RecordingServiceSystem], { after: PresentationSystemGroup })
}

export const initializeEngineForRecorder = async () => {
  if (getMutableState(EngineState).isEngineInitialized.value) return

  const projects = API.instance.client.service('projects').find()

  startCaptureSystems()
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
