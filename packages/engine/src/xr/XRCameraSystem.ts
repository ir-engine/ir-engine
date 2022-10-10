import { Matrix4, PerspectiveCamera } from 'three'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { LocalTransformComponent, TransformComponent } from '../transform/components/TransformComponent'

const updateXRCameraTransform = (camera: PerspectiveCamera, originMatrix: Matrix4) => {
  camera.matrixWorld.multiplyMatrices(originMatrix, camera.matrix)
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
}

export const updateXRInput = (world = Engine.instance.currentWorld) => {
  const xrManager = EngineRenderer.instance.xrManager
  const camera = Engine.instance.currentWorld.camera as PerspectiveCamera

  /*
   * Updates the XR camera to the camera position, including updating it's world matrix
   */
  xrManager.updateCamera(camera)

  /*
   * We want to position the camera relative to the xr origin
   */
  const cameraLocalTransform = getComponent(world.cameraEntity, LocalTransformComponent)
  cameraLocalTransform.matrix.copy(camera.matrixWorld)
  cameraLocalTransform.position.copy(camera.position)
  cameraLocalTransform.rotation.copy(camera.quaternion)
  cameraLocalTransform.scale.copy(camera.scale)

  /*
   * xr cameras also have to have their world transforms updated relative to the origin, as these are used for actual rendering
   */
  const originTransform = getComponent(world.originEntity, TransformComponent)
  const cameraXR = EngineRenderer.instance.xrManager.getCamera()
  updateXRCameraTransform(cameraXR, originTransform.matrix)
  for (const camera of cameraXR.cameras) updateXRCameraTransform(camera, originTransform.matrix)
}

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
export default async function XRCameraSystem(world: World) {
  const execute = () => {
    if (!EngineRenderer.instance.xrSession) return

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
