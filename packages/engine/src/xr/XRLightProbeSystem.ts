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

import { getMutableState, getState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { RendererState } from '../renderer/RendererState'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { XREstimatedLight } from './XREstimatedLight'
import { XRState } from './XRState'

const initializeLight = () => {
  const xrLight = new XREstimatedLight(EngineRenderer.instance.renderer)
  xrLight.castShadow = true
  xrLight.directionalLight.shadow.bias = -0.000001
  xrLight.directionalLight.shadow.radius = 1
  xrLight.directionalLight.shadow.camera.far = 2000
  xrLight.directionalLight.castShadow = true

  let previousEnvironment = Engine.instance.scene.environment

  xrLight.addEventListener('estimationstart', () => {
    const xrState = getMutableState(XRState)
    if (xrState.sessionMode.value !== 'immersive-ar') return
    // Swap the default light out for the estimated one one we start getting some estimated values.
    Engine.instance.origin.add(xrLight)

    // The estimated lighting also provides an environment cubemap, which we can apply here.
    if (xrLight.environment) {
      previousEnvironment = Engine.instance.scene.environment
      Engine.instance.scene.environment = xrLight.environment
    }

    xrState.isEstimatingLight.set(true)
  })

  xrLight.addEventListener('estimationend', () => {
    const xrState = getMutableState(XRState)
    if (xrState.sessionMode.value !== 'immersive-ar') return
    xrLight.removeFromParent()
    Engine.instance.scene.environment = previousEnvironment
    xrState.isEstimatingLight.set(false)
  })

  const xrState = getMutableState(XRState)
  xrState.lightEstimator.set(xrLight)
}

/**
 * https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_lighting.html
 */
const execute = () => {
  const xrState = getState(XRState)

  // TODO initializeLight is implemented on threejs' impl and not on our custom WebXRManager
  if (EngineRenderer.instance.renderer.xr && !xrState.lightEstimator) {
    // initializeLight()
  }

  if (getState(RendererState).csm && xrState.isEstimatingLight) {
    // maybe use -1 * pos
    xrState.lightEstimator.directionalLight.getWorldDirection(getState(RendererState).csm!.lightDirection)
  }
}

const reactor = () => {
  useEffect(() => {
    return () => {
      getMutableState(XRState).lightEstimator.set(null!)
    }
  }, [])

  return null
}

export const XRLightProbeSystem = defineSystem({
  uuid: 'ee.engine.XRLightProbeSystem',
  execute,
  reactor
})
