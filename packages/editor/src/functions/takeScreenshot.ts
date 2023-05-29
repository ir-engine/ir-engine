import { blob } from 'stream/consumers'
import {
  _SRGBFormat,
  Camera,
  ClampToEdgeWrapping,
  LinearFilter,
  PerspectiveCamera,
  RGBAFormat,
  sRGBEncoding,
  UnsignedByteType,
  WebGLRenderTarget
} from 'three'

import { KTX2Encoder } from '@etherealengine/engine/src/assets/loaders/ktx2/KTX2Encoder'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { addComponent, defineQuery, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addEntityNodeChild } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import {
  setTransformComponent,
  TransformComponent
} from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'

import { EditorState } from '../services/EditorServices'

function getResizedCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = width
  tmpCanvas.height = height
  const ctx = tmpCanvas.getContext('2d')
  if (ctx) ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height)
  return tmpCanvas
}

const query = defineQuery([ScenePreviewCameraComponent])

const ktx2Encoder = new KTX2Encoder()

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
    for (const entity of query()) {
      scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
    }

    if (!scenePreviewCamera) {
      const entity = createEntity()
      addComponent(entity, ScenePreviewCameraComponent)
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

  EngineRenderer.instance.effectComposer.render()
  EngineRenderer.instance.effectComposer.setMainCamera(Engine.instance.camera)

  const renderer = EngineRenderer.instance.renderer
  renderer.outputEncoding = sRGBEncoding
  const renderTarget = new WebGLRenderTarget(width, height, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    encoding: sRGBEncoding,
    format: RGBAFormat,
    type: UnsignedByteType
  })

  renderer.setRenderTarget(renderTarget)
  renderer.render(Engine.instance.scene, scenePreviewCamera)
  const pixels = new Uint8Array(4 * width * height)
  renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels)
  const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)
  renderer.setRenderTarget(null) // pass `null` to set canvas as render target
  EngineRenderer.instance.effectComposer.setSize(originalWidth, originalHeight, true)

  // Restoring previous state
  scenePreviewCamera.aspect = prevAspect
  scenePreviewCamera.updateProjectionMatrix()

  const ktx2texture = (await ktx2Encoder.encode(imageData, {
    srgb: true,
    uastc: true,
    uastcZstandard: true
  })) as ArrayBuffer

  return new Blob([ktx2texture])
}

/** @todo make size configurable */
export const downloadScreenshot = () => {
  takeScreenshot(1920 * 4, 1080 * 4, false, Engine.instance.camera).then((blob) => {
    if (!blob) return

    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')

    const editorState = getState(EditorState)

    link.href = blobUrl
    link.download = editorState.projectName + '_' + editorState.sceneName + '_thumbnail.ktx2'

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
  })
}
