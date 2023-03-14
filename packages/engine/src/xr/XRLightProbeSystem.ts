import { getMutableState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { XREstimatedLight } from './XREstimatedLight'
import { XRState } from './XRState'

/**
 * https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_lighting.html
 */
export default async function XRLightProbeSystem() {
  const xrLight = new XREstimatedLight(EngineRenderer.instance.renderer)
  xrLight.castShadow = true
  xrLight.directionalLight.shadow.bias = -0.000001
  xrLight.directionalLight.shadow.radius = 1
  xrLight.directionalLight.shadow.camera.far = 2000
  xrLight.directionalLight.castShadow = true

  const xrState = getMutableState(XRState)
  xrState.lightEstimator.set(xrLight)

  let previousEnvironment = Engine.instance.scene.environment

  xrLight.addEventListener('estimationstart', () => {
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
    if (xrState.sessionMode.value !== 'immersive-ar') return
    xrLight.removeFromParent()
    Engine.instance.scene.environment = previousEnvironment
    xrState.isEstimatingLight.set(false)
  })

  const execute = () => {
    if (EngineRenderer.instance.csm && xrState.isEstimatingLight.value) {
      // maybe use -1 * pos
      xrLight.directionalLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup, subsystems: [] }
}
