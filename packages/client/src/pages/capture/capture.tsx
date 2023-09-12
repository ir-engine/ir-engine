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

import {
  useLoadEngineWithScene,
  useOfflineNetwork,
  useOnlineNetwork
} from '@etherealengine/client-core/src/components/World/EngineHooks'
import {
  useLoadLocation,
  useLoadLocationScene,
  useLoadScene
} from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { ClientNetworkingSystem } from '@etherealengine/client-core/src/networking/ClientNetworkingSystem'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { SceneService } from '@etherealengine/client-core/src/world/services/SceneService'
import { useDefaultLocationSystems } from '@etherealengine/client-core/src/world/useDefaultLocationSystems'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import CaptureUI from '@etherealengine/ui/src/pages/Capture'

const startCaptureSystems = () => {
  startSystems([ClientNetworkingSystem], { after: PresentationSystemGroup })
}

export const CaptureLocation = () => {
  const params = useParams()

  useEffect(() => {
    const canvas = document.getElementById('engine-renderer-canvas')!
    canvas.parentElement?.removeChild(canvas)

    return () => {
      const body = document.body
      body.appendChild(canvas)
    }
  }, [])

  useLoadLocationScene()
  useLoadEngineWithScene()

  useDefaultLocationSystems(true)

  const locationName = params?.locationName as string | undefined
  const offline = !locationName

  if (offline) {
    useLoadScene({ projectName: 'default-project', sceneName: 'default' })
  } else {
    useLoadLocation({ locationName: params.locationName! })
  }

  if (offline) {
    useOfflineNetwork()
  } else {
    useOnlineNetwork()
  }

  AuthService.useAPIListeners()
  SceneService.useAPIListeners()

  useEffect(() => {
    startCaptureSystems()
  }, [])

  const engineState = useHookstate(getMutableState(EngineState))

  if (!engineState.connectedWorld.value) return <></>

  return <CaptureUI />
}

export default CaptureLocation
