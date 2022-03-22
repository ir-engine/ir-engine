import { PerspectiveCamera, Vector2 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { ScenePreviewCameraTagComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { deserializeScenePreviewCamera } from '@xrengine/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'

import { getCanvasBlob } from './thumbnails'

/**
 * Function takeScreenshot used for taking screenshots.
 *
 * @author Robert Long
 * @param  {any}  width
 * @param  {any}  height
 * @return {Promise}        [generated screenshot according to height and width]
 */
export async function takeScreenshot(width: number, height: number): Promise<Blob | null> {
  EngineRenderer.instance.disableUpdate = true
  const size = new Vector2()
  Engine.renderer.getSize(size)

  let scenePreviewCamera: PerspectiveCamera = null!
  const query = defineQuery([ScenePreviewCameraTagComponent])

  for (const entity of query()) {
    scenePreviewCamera = getComponent(entity, Object3DComponent).value as PerspectiveCamera
  }

  if (!scenePreviewCamera) {
    const entity = createEntity()
    deserializeScenePreviewCamera(entity, null!)

    scenePreviewCamera = getComponent(entity, Object3DComponent).value as PerspectiveCamera
    Engine.camera.matrix.decompose(scenePreviewCamera.position, scenePreviewCamera.quaternion, scenePreviewCamera.scale)
  }

  const prevAspect = scenePreviewCamera.aspect
  scenePreviewCamera.aspect = width / height
  scenePreviewCamera.updateProjectionMatrix()
  scenePreviewCamera.layers.disableAll()
  scenePreviewCamera.layers.set(ObjectLayers.Scene)
  Engine.renderer.setSize(width, height, false)
  Engine.renderer.render(Engine.scene, scenePreviewCamera)
  const blob = await getCanvasBlob(Engine.renderer.domElement)
  scenePreviewCamera.aspect = prevAspect
  scenePreviewCamera.updateProjectionMatrix()
  Engine.renderer.setSize(size.x, size.y, false)
  EngineRenderer.instance.disableUpdate = false
  return blob
}
