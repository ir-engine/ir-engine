/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'
import CaptureUI from '@etherealengine/ui/src/pages/Capture'

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

    getMutableState(NetworkState).config.set({
      world: true,
      media: true,
      friends: false,
      instanceID: true,
      roomID: false
    })
  }, [])

  const engineState = useHookstate(getMutableState(EngineState))

  if (!engineState.isEngineInitialized.value && !engineState.connectedWorld.value) return <></>

  return <CaptureUI />
}

export default CaptureLocation
