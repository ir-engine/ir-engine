import { PerspectiveCamera } from 'three'

import { getState } from '@xrengine/hyperflux'

import { DualQuaternion } from '../common/classes/DualQuaternion'
import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRState } from './XRState'

const _pose = new DualQuaternion()

export const updateXRInput = (world = Engine.instance.currentWorld) => {
  const xrState = getState(XRState)
  const xrManager = EngineRenderer.instance.xrManager
  const camera = world.camera as PerspectiveCamera

  /*
   * Updates the XR camera to the camera position, including updating it's world matrix
   */
  xrManager.updateCamera(camera)
  const cameraTransform = getComponent(world.cameraEntity, TransformComponent)
  cameraTransform.matrix.copy(camera.matrix)
  cameraTransform.matrixInverse.copy(cameraTransform.matrix).invert()
  cameraTransform.position.copy(camera.position)
  cameraTransform.rotation.copy(camera.quaternion)
  cameraTransform.scale.copy(camera.scale)

  const xrFrame = Engine.instance.xrFrame
  const referenceSpace = xrState.localFloorReferenceSpace.value
  /** get viewer pose relative to the local floor */
  const viewerXRPose = referenceSpace && xrFrame?.getViewerPose(referenceSpace)

  if (viewerXRPose) {
    const viewerPose = _pose.makeFromXRPose(viewerXRPose)
    xrState.viewerPoseDeltaMetric.value.update(viewerPose)
  } else {
    xrState.viewerPoseDeltaMetric.value.update(null)
  }
}

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
export default async function XRCameraSystem(world: World) {
  const execute = () => {
    if (!Engine.instance.xrFrame) return
    updateXRInput(world)
    // Assume world.camera.layers is source of truth for all xr cameras
    const camera = Engine.instance.currentWorld.camera as PerspectiveCamera
    const xrCamera = EngineRenderer.instance.xrManager.getCamera()
    xrCamera.layers.mask = camera.layers.mask
    for (const c of xrCamera.cameras) c.layers.mask = camera.layers.mask
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
