import { PerspectiveCamera } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
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
import { getState } from '@etherealengine/hyperflux'

import { EditorState } from '../services/EditorServices'
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
export async function takeScreenshot(
  width: number,
  height: number,
  compressed = true,
  scenePreviewCamera?: PerspectiveCamera
): Promise<Blob | null> {
  // Getting Scene preview camera or creating one if not exists
  if (!scenePreviewCamera) {
    const query = defineQuery([ScenePreviewCameraComponent])

    for (const entity of query()) {
      scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
    }

    if (!scenePreviewCamera) {
      const entity = createEntity()
      addComponent(entity, ScenePreviewCameraComponent, null)
      scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
      const { position, rotation } = getComponent(Engine.instance.cameraEntity, TransformComponent)
      setTransformComponent(entity, position, rotation)
      addObjectToGroup(entity, scenePreviewCamera)
      addEntityNodeChild(entity, getState(SceneState).sceneEntity)
      scenePreviewCamera.updateMatrixWorld(true)
    }
  }

  const prevAspect = scenePreviewCamera.aspect

  // Setting up scene preview camera
  scenePreviewCamera.aspect = width / height
  scenePreviewCamera.updateProjectionMatrix()
  scenePreviewCamera.layers.disableAll()
  scenePreviewCamera.layers.set(ObjectLayers.Scene)

  const originalWidth = EngineRenderer.instance.renderer.domElement.width
  const originalHeight = EngineRenderer.instance.renderer.domElement.height

  // Rendering the scene to the new canvas with given size
  await new Promise<void>((resolve, reject) => {
    const interval = setInterval(() => {
      const viewport = EngineRenderer.instance.renderContext.getParameter(
        EngineRenderer.instance.renderContext.VIEWPORT
      )
      if (viewport[2] === width && viewport[3] === height) {
        clearTimeout(timeout)
        clearInterval(interval)
        resolve()
      }
    }, 10)
    const timeout = setTimeout(() => {
      console.warn('Could not resize viewport in time')
      clearTimeout(timeout)
      clearInterval(interval)
      reject()
    }, 10000)

    // set up effect composer
    configureEffectComposer(false, scenePreviewCamera)
    EngineRenderer.instance.effectComposer.setSize(width, height, true)
  })

  EngineRenderer.instance.effectComposer.render()
  configureEffectComposer(false, Engine.instance.camera)

  const blob = await getCanvasBlob(
    getResizedCanvas(EngineRenderer.instance.renderer.domElement, width, height),
    compressed ? 'image/jpeg' : 'image/png',
    compressed ? 0.9 : 1
  )

  EngineRenderer.instance.effectComposer.setSize(originalWidth, originalHeight, true)

  // Restoring previous state
  scenePreviewCamera.aspect = prevAspect
  scenePreviewCamera.updateProjectionMatrix()

  return blob
}

/** @todo make size configurable */
export const downloadScreenshot = () => {
  takeScreenshot(1920 * 4, 1080 * 4, false, Engine.instance.camera).then((blob) => {
    if (!blob) return

    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')

    const editorState = getState(EditorState)

    link.href = blobUrl
    link.download = editorState.projectName + '_' + editorState.sceneName + '_thumbnail.png'

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
  })
}
