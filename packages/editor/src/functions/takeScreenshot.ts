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
  EngineRenderer.instance.renderer.getSize(size)

  let scenePreviewCamera: PerspectiveCamera = null!
  const query = defineQuery([ScenePreviewCameraTagComponent])

  for (const entity of query()) {
    scenePreviewCamera = getComponent(entity, Object3DComponent).value as PerspectiveCamera
  }

  if (!scenePreviewCamera) {
    const entity = createEntity()
    deserializeScenePreviewCamera(entity, null!)

    scenePreviewCamera = getComponent(entity, Object3DComponent).value as PerspectiveCamera
    Engine.instance.camera.matrix.decompose(
      scenePreviewCamera.position,
      scenePreviewCamera.quaternion,
      scenePreviewCamera.scale
    )
  }

  const prevAspect = scenePreviewCamera.aspect
  scenePreviewCamera.aspect = width / height
  scenePreviewCamera.updateProjectionMatrix()
  scenePreviewCamera.layers.disableAll()
  scenePreviewCamera.layers.set(ObjectLayers.Scene)
  EngineRenderer.instance.renderer.setSize(width, height, false)
  EngineRenderer.instance.renderer.render(Engine.instance.scene, scenePreviewCamera)
  const blob = await getCanvasBlob(EngineRenderer.instance.renderer.domElement)
  scenePreviewCamera.aspect = prevAspect
  scenePreviewCamera.updateProjectionMatrix()
  EngineRenderer.instance.renderer.setSize(size.x, size.y, false)
  EngineRenderer.instance.disableUpdate = false
  return blob
}
