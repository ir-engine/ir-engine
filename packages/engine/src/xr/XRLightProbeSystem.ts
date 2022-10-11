import { getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { XREstimatedLight } from './XREstimatedLight'
import { XRState } from './XRState'

/**
 * https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_lighting.html
 */
export default async function XRLightProbeSystem(world: World) {
  const xrLight = new XREstimatedLight(EngineRenderer.instance.renderer)
  xrLight.castShadow = true
  xrLight.directionalLight.shadow.bias = -0.000001
  xrLight.directionalLight.shadow.radius = 1
  xrLight.directionalLight.shadow.camera.far = 2000
  xrLight.directionalLight.castShadow = true

  getState(XRState).lightEstimator.set(xrLight)
  const estimatingLight = getState(XRState).isEstimatingLight

  let previousEnvironment = Engine.instance.currentWorld.scene.environment

  xrLight.addEventListener('estimationstart', () => {
    // Swap the default light out for the estimated one one we start getting some estimated values.
    Engine.instance.currentWorld.origin.add(xrLight)

    // The estimated lighting also provides an environment cubemap, which we can apply here.
    if (xrLight.environment) {
      previousEnvironment = Engine.instance.currentWorld.scene.environment
      Engine.instance.currentWorld.scene.environment = xrLight.environment
    }

    estimatingLight.set(true)
  })

  xrLight.addEventListener('estimationend', () => {
    xrLight.removeFromParent()
    Engine.instance.currentWorld.scene.environment = previousEnvironment
    estimatingLight.set(true)
  })

  const execute = () => {
    if (EngineRenderer.instance.csm && estimatingLight.value) {
      // maybe use -1 * pos
      xrLight.directionalLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup, subsystems: [] }
}
