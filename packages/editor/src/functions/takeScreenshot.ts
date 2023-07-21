/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  Camera,
  ClampToEdgeWrapping,
  LinearFilter,
  PerspectiveCamera,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  Vector2,
  WebGLRenderTarget
} from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { defineQuery, getComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addEntityNodeChild } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { ScreenshotSettings } from '@etherealengine/engine/src/scene/classes/ImageUtils'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import {
  TransformComponent,
  setTransformComponent
} from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'
import { KTX2Encoder } from '@etherealengine/xrui/core/textures/KTX2Encoder'

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

const query = defineQuery([ScenePreviewCameraComponent])

const ktx2Encoder = new KTX2Encoder()

/**
 * Function takeScreenshot used for taking screenshots.
 *
 * @param  {any}  width
 * @param  {any}  height
 * @param  {any}  quality
 * @return {Promise}        [generated screenshot according to height and width]
 */

// TODO: Remove this function later when integrating effect composer for screenshots KTX.
// Keeping this for now as screenshots with composer cause studio viewport to resize rapidly, causing flashing
export async function previewScreenshot(
  width: number,
  height: number,
  quality = 0.9,
  scenePreviewCamera?: PerspectiveCamera
): Promise<Blob | null> {
  // Getting Scene preview camera or creating one if not exists
  if (!scenePreviewCamera) {
    for (const entity of query()) {
      scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
    }

    if (!scenePreviewCamera) {
      const entity = createEntity()
      setComponent(entity, ScenePreviewCameraComponent)
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

  let blob: Blob | null = null
  const renderer = EngineRenderer.instance.renderer
  renderer.outputColorSpace = SRGBColorSpace
  const renderTarget = new WebGLRenderTarget(width, height, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    colorSpace: SRGBColorSpace,
    format: RGBAFormat,
    type: UnsignedByteType
  })

  renderer.setRenderTarget(renderTarget)

  renderer.render(Engine.instance.scene, scenePreviewCamera)

  const pixels = new Uint8Array(4 * width * height)
  renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels)
  const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)
  const flippedData = new Uint8ClampedArray(imageData.data.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const flippedY = height - y - 1 // Calculate the flipped y-coordinate
      const sourceIndex = (y * width + x) * 4
      const targetIndex = (flippedY * width + x) * 4
      flippedData[targetIndex] = imageData.data[sourceIndex]
      flippedData[targetIndex + 1] = imageData.data[sourceIndex + 1]
      flippedData[targetIndex + 2] = imageData.data[sourceIndex + 2]
      flippedData[targetIndex + 3] = imageData.data[sourceIndex + 3]
    }
  }
  const flippedImageData = new ImageData(flippedData, width, height)

  renderer.setRenderTarget(null) // pass `null` to set canvas as render target
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = width
  canvas.height = height
  ctx.putImageData(flippedImageData, 0, 0)
  ctx.scale(1, -1)
  blob = await getCanvasBlob(canvas, 'image/jpeg', quality)

  // Restoring previous state
  scenePreviewCamera.aspect = prevAspect
  scenePreviewCamera.updateProjectionMatrix()

  return blob
}

export async function takeScreenshot(
  width: number,
  height: number,
  format = 'ktx2' as 'png' | 'ktx2' | 'jpeg',
  scenePreviewCamera?: PerspectiveCamera
): Promise<Blob | null> {
  // Getting Scene preview camera or creating one if not exists
  if (!scenePreviewCamera) {
    for (const entity of query()) {
      scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
    }

    if (!scenePreviewCamera) {
      const entity = createEntity()
      setComponent(entity, ScenePreviewCameraComponent)
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

  const originalSize = EngineRenderer.instance.renderer.getSize(new Vector2())

  const pixelRatio = EngineRenderer.instance.renderer.getPixelRatio()

  // Rendering the scene to the new canvas with given size
  await new Promise<void>((resolve, reject) => {
    const interval = setInterval(() => {
      const viewport = EngineRenderer.instance.renderContext.getParameter(
        EngineRenderer.instance.renderContext.VIEWPORT
      )
      // todo - scrolling in and out sometimes causes weird pixel ratios that can cause this to fail
      if (viewport[2] === Math.round(width * pixelRatio) && viewport[3] === Math.round(height * pixelRatio)) {
        console.log('Resized viewport')
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
    EngineRenderer.instance.effectComposer.setMainCamera(scenePreviewCamera as Camera)
    EngineRenderer.instance.effectComposer.setSize(width, height, false)
    EngineRenderer.instance.renderer.setPixelRatio(1)
  })

  let blob: Blob | null = null

  if (format === 'ktx2') {
    const renderer = EngineRenderer.instance.renderer
    // todo - support post processing
    // EngineRenderer.instance.effectComposer.setMainCamera(scenePreviewCamera as Camera)
    // const renderer = EngineRenderer.instance.effectComposer.getRenderer()
    renderer.outputColorSpace = SRGBColorSpace
    const renderTarget = new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      colorSpace: SRGBColorSpace,
      format: RGBAFormat,
      type: UnsignedByteType
    })

    renderer.setRenderTarget(renderTarget)

    // EngineRenderer.instance.effectComposer.render()
    renderer.render(Engine.instance.scene, scenePreviewCamera)

    const pixels = new Uint8Array(4 * width * height)
    renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels)
    const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)
    renderer.setRenderTarget(null) // pass `null` to set canvas as render target

    const ktx2texture = (await ktx2Encoder.encode(imageData, getState(ScreenshotSettings).ktx2)) as ArrayBuffer

    blob = new Blob([ktx2texture])
  } else {
    EngineRenderer.instance.effectComposer.render()

    blob = await getCanvasBlob(
      getResizedCanvas(EngineRenderer.instance.renderer.domElement, width, height),
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      format === 'jpeg' ? 0.9 : 1
    )
  }

  // restore
  EngineRenderer.instance.effectComposer.setMainCamera(Engine.instance.camera)
  EngineRenderer.instance.effectComposer.setSize(originalSize.width, originalSize.height, false)
  EngineRenderer.instance.renderer.setPixelRatio(pixelRatio)

  // Restoring previous state
  scenePreviewCamera.aspect = prevAspect
  scenePreviewCamera.updateProjectionMatrix()

  return blob
}

/** @todo make size, compression & format configurable */
export const downloadScreenshot = () => {
  takeScreenshot(1920 * 4, 1080 * 4, 'png', Engine.instance.camera).then((blob) => {
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
