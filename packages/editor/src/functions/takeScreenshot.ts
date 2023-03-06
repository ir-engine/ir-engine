import { PerspectiveCamera } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { addComponent, defineQuery, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addEntityNodeChild } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { configureEffectComposer } from '@etherealengine/engine/src/renderer/functions/configureEffectComposer'
import {
  EngineRenderer,
  getPostProcessingSceneMetadataState
} from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import {
  setTransformComponent,
  TransformComponent
} from '@etherealengine/engine/src/transform/components/TransformComponent'

import { getCanvasBlob } from './thumbnails'

function getResizedCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = width
  tmpCanvas.height = height
  const ctx = tmpCanvas.getContext('2d')
  if (ctx) ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height)
  return tmpCanvas
}

/**
 * Function takeScreenshot used for taking screenshots.
 *
 * @param  {any}  width
 * @param  {any}  height
 * @return {Promise}        [generated screenshot according to height and width]
 */
export async function takeScreenshot(width: number, height: number): Promise<Blob | null> {
  // Getting Scene preview camera or creating one if not exists
  let scenePreviewCamera: PerspectiveCamera = null!
  const query = defineQuery([ScenePreviewCameraComponent])

  for (const entity of query()) {
    scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
  }

  if (!scenePreviewCamera) {
    const entity = createEntity()
    addComponent(entity, ScenePreviewCameraComponent, null)
    scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
    const { position, rotation } = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent)
    setTransformComponent(entity, position, rotation)
    addObjectToGroup(entity, scenePreviewCamera)
    addEntityNodeChild(entity, Engine.instance.currentWorld.sceneEntity)
    scenePreviewCamera.updateMatrixWorld(true)
  }

  const prevAspect = scenePreviewCamera.aspect

  // Setting up scene preview camera
  scenePreviewCamera.aspect = width / height
  scenePreviewCamera.updateProjectionMatrix()
  scenePreviewCamera.layers.disableAll()
  scenePreviewCamera.layers.set(ObjectLayers.Scene)

  // Rendering the scene to the new canvas with given size
  if (getPostProcessingSceneMetadataState(Engine.instance.currentWorld).enabled.value) {
    configureEffectComposer(false, scenePreviewCamera)
    EngineRenderer.instance.effectComposer.render()
    configureEffectComposer(false, Engine.instance.currentWorld.camera)
  } else {
    EngineRenderer.instance.renderer.render(Engine.instance.currentWorld.scene, scenePreviewCamera)
  }
  const blob = await getCanvasBlob(getResizedCanvas(EngineRenderer.instance.renderer.domElement, width, height))

  // Restoring previous state
  scenePreviewCamera.aspect = prevAspect
  scenePreviewCamera.updateProjectionMatrix()

  return blob
}
