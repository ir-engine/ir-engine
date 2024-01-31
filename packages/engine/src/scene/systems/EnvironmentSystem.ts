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

import { useEffect } from 'react'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { Engine } from '@etherealengine/ecs/src/Engine'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { XRLightProbeState } from '@etherealengine/spatial/src/xr/XRLightProbeSystem'
import { XRState } from '@etherealengine/spatial/src/xr/XRState'
import { Texture } from 'three'
import { SceneLoadingSystem } from './SceneLoadingSystem'

const reactor = () => {
  const background = useHookstate(getMutableState(SceneState).background)
  const environment = useHookstate(getMutableState(SceneState).environment)
  const sessionMode = useHookstate(getMutableState(XRState).sessionMode)
  const lightProbeEnvironment = useHookstate(getMutableState(XRLightProbeState).environment)

  /** @todo when we have asset loader hooks we can change this */
  useEffect(() => {
    if (!background.value) return
    const backgroundTexture = background.value
    if (backgroundTexture instanceof Texture)
      return () => {
        backgroundTexture.dispose()
      }
  }, [background])

  useEffect(() => {
    Engine.instance.scene.background = sessionMode.value === 'immersive-ar' ? null : background.value
  }, [background, sessionMode])

  useEffect(() => {
    Engine.instance.scene.environment = lightProbeEnvironment.value ?? environment.value
  }, [environment, lightProbeEnvironment])

  return null
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { with: SceneLoadingSystem },
  reactor
})
