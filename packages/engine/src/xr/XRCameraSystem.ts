import { Matrix4, PerspectiveCamera } from 'three'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { TransformComponent } from '../transform/components/TransformComponent'

const updateXRCameraTransform = (camera: PerspectiveCamera, originMatrix: Matrix4) => {
  camera.matrixWorld.multiplyMatrices(originMatrix, camera.matrix)
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
}

export const updateXRInput = (world = Engine.instance.currentWorld) => {
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
  /*
   * xr cameras also have to have their world transforms updated relative to the origin, as these are used for actual rendering
   */
  // const originTransform = getComponent(world.originEntity, TransformComponent)
  // const cameraXR = xrManager.getCamera()
  // updateXRCameraTransform(cameraXR, originTransform.matrix)
  // for (const camera of cameraXR.cameras) updateXRCameraTransform(camera, originTransform.matrix)

  /** compute transform matricies with new information */
  // computeTransformMatrix(world.cameraEntity, world)
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
