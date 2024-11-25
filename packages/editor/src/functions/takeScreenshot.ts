/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { PerspectiveCamera, Vector2 } from 'three'

import { getCanvasBlob } from '@ir-engine/client-core/src/common/utils'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { ScenePreviewCameraComponent } from '@ir-engine/engine/src/scene/components/ScenePreviewCamera'
import { getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { KTX2Encoder } from '@ir-engine/xrui/core/textures/KTX2Encoder'

import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { EditorState } from '../services/EditorServices'

function getResizedCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = width
  tmpCanvas.height = height
  const ctx = tmpCanvas.getContext('2d')
  if (ctx) ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height)
  return tmpCanvas
}

const scenePreviewCameraQuery = defineQuery([ScenePreviewCameraComponent, SourceComponent])

const ktx2Encoder = new KTX2Encoder()

/**
 * Function takeScreenshot used for taking screenshots.
 *
 * @param  {any}  width
 * @param  {any}  height
 * @param  {any}  quality
 * @return {Promise}        [generated screenshot according to height and width]
 */

export async function takeScreenshot(
  width: number,
  height: number,
  quality: number = 0.9,
  format = 'jpeg' as 'jpeg' | 'png',
  scenePreviewCamera?: PerspectiveCamera,
  hideHelpers = true
): Promise<Blob | null> {
  // Getting Scene preview camera or creating one if not exists
  if (!scenePreviewCamera) {
    for (const entity of scenePreviewCameraQuery()) {
      scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
    }

    if (!scenePreviewCamera) {
      const entity = createEntity()
      setComponent(entity, ScenePreviewCameraComponent)
      scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
      const { position, rotation } = getComponent(getState(EngineState).viewerEntity, TransformComponent)
      setComponent(entity, TransformComponent, { position, rotation })
      addObjectToGroup(entity, scenePreviewCamera)
      setComponent(entity, EntityTreeComponent, {
        parentEntity: getState(EditorState).rootEntity
      })
      scenePreviewCamera.updateMatrixWorld(true)
    }
  }

  const prevAspect = scenePreviewCamera.aspect
  const prevLayers = scenePreviewCamera.layers
  const prevLayersMask = scenePreviewCamera.layers.mask
  const camera = getComponent(getState(EngineState).viewerEntity, CameraComponent)

  // Setting up scene preview camera
  scenePreviewCamera.aspect = width / height
  scenePreviewCamera.updateProjectionMatrix()
  scenePreviewCamera.layers.disableAll()
  scenePreviewCamera.layers.set(ObjectLayers.Scene)

  const rendererComponent = getComponent(getState(EngineState).viewerEntity, RendererComponent)
  const renderer = rendererComponent.renderer!
  const renderContext = rendererComponent.renderContext!
  const effectComposer = rendererComponent.effectComposer!

  if (hideHelpers) {
    effectComposer.OutlineEffect?.clearSelection()
  }

  const originalSize = renderer.getSize(new Vector2())
  const pixelRatio = renderer.getPixelRatio()
  effectComposer.setMainCamera(scenePreviewCamera as PerspectiveCamera)

  // Rendering the scene to the new canvas with given size
  await new Promise<void>((resolve, reject) => {
    const interval = setInterval(() => {
      const viewport = renderContext.getParameter(renderContext.VIEWPORT)
      if (viewport[2] === Math.round(width) && viewport[3] === Math.round(height)) {
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
    effectComposer.setMainCamera(scenePreviewCamera as PerspectiveCamera)
    renderer.setPixelRatio(1)
    effectComposer.setSize(width, height, false)
  })

  effectComposer.setMainCamera(scenePreviewCamera as PerspectiveCamera)
  effectComposer.render()
  const canvas = getResizedCanvas(renderer.domElement, width, height)

  // Restoring previous state
  scenePreviewCamera.layers = prevLayers
  scenePreviewCamera.layers.mask = prevLayersMask
  scenePreviewCamera.aspect = prevAspect
  scenePreviewCamera.updateProjectionMatrix()

  // restore
  effectComposer.setMainCamera(camera)
  renderer.setPixelRatio(pixelRatio)
  effectComposer.setSize(originalSize.width, originalSize.height, false)

  const imageBlob = await getCanvasBlob(
    canvas,
    format === 'jpeg' ? 'image/jpeg' : 'image/png',
    format === 'jpeg' ? quality : 1
  )

  return imageBlob
}

/** @todo make size, compression & format configurable */
export const downloadScreenshot = () => {
  takeScreenshot(
    1920 * 4,
    1080 * 4,
    1,
    'png',
    getComponent(getState(EngineState).viewerEntity, CameraComponent),
    false
  ).then((blob) => {
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
