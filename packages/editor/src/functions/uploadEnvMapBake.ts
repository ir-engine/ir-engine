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

import { Scene, Vector3 } from 'three'

import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import CubemapCapturer from '@ir-engine/engine/src/scene/classes/CubemapCapturer'
import {
  convertCubemapToEquiImageData,
  convertImageDataToKTX2Blob
} from '@ir-engine/engine/src/scene/classes/ImageUtils'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { ScenePreviewCameraComponent } from '@ir-engine/engine/src/scene/components/ScenePreviewCamera'
import { getState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import {
  RendererComponent,
  getNestedVisibleChildren,
  getSceneParameters
} from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { EditorState } from '../services/EditorServices'
import { uploadProjectFiles } from './assetFunctions'

const query = defineQuery([ScenePreviewCameraComponent, TransformComponent])

const getScenePositionForBake = (entity?: Entity) => {
  if (entity) {
    const transformComponent = getComponent(entity, TransformComponent)
    return transformComponent.position
  }
  let entityToBakeFrom: Entity
  entityToBakeFrom = query()[0]

  // fall back somewhere behind the world origin
  if (entityToBakeFrom) {
    const transformComponent = getComponent(entityToBakeFrom, TransformComponent)
    if (transformComponent?.position) return transformComponent.position
  }
  return new Vector3(0, 2, 5)
}

/**
 * Generates and uploads a BPCEM envmap for a specific entity to the current project
 * If the entity provided is the root node for the scene, it will set this as the environment map
 *
 * TODO: make this not the default behavior, instead we want an option in the envmap properties of the scene node,
 *   which will dictate where the envmap is source from see issue #5751
 *
 * @param entity
 * @returns
 */

export const uploadBPCEMBakeToServer = async (entity: Entity) => {
  const isSceneEntity = entity === getState(EditorState).rootEntity

  if (isSceneEntity) {
    if (!hasComponent(entity, EnvMapBakeComponent)) {
      setComponent(entity, EnvMapBakeComponent, { resolution: 1024 })
    }
  }

  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  const position = getScenePositionForBake(isSceneEntity ? undefined : entity)

  const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!

  const scene = new Scene()

  const cubemapCapturer = new CubemapCapturer(renderer, scene, bakeComponent.resolution)
  const renderTarget = cubemapCapturer.update(position)

  if (isSceneEntity) scene.environment = renderTarget.texture

  const envmapImageData = convertCubemapToEquiImageData(
    renderer,
    renderTarget.texture,
    bakeComponent.resolution,
    bakeComponent.resolution
  ) as ImageData

  const envmap = await convertImageDataToKTX2Blob(envmapImageData)

  if (!envmap) return null!

  const nameComponent = getComponent(entity, NameComponent)
  const editorState = getState(EditorState)
  const sceneName = editorState.sceneName!
  const projectName = editorState.projectName!
  const filename = isSceneEntity ? `${sceneName}.envmap.ktx2` : `${sceneName}-${nameComponent.replace(' ', '-')}.ktx2`

  const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')
  const url = (
    await uploadProjectFiles(projectName, [new File([envmap], filename)], [currentSceneDirectory]).promises[0]
  )[0]

  const cleanURL = new URL(url)
  cleanURL.hash = ''
  cleanURL.search = ''

  setComponent(entity, EnvMapBakeComponent, { envMapOrigin: cleanURL.href })
}

/** @todo replace resolution with LODs */
export const generateEnvmapBake = (resolution = 2048) => {
  const position = getScenePositionForBake()
  const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!

  const rootEntity = getState(EditorState).rootEntity
  const entitiesToRender = getNestedVisibleChildren(rootEntity)
  const sceneData = getSceneParameters(entitiesToRender)
  const scene = new Scene()
  scene.children = sceneData.children
  scene.background = sceneData.background
  scene.fog = sceneData.fog
  scene.environment = sceneData.environment

  const cubemapCapturer = new CubemapCapturer(renderer, scene, resolution)
  const renderTarget = cubemapCapturer.update(position)

  const originalEnvironment = scene.environment
  scene.environment = renderTarget.texture

  const envmapImageData = convertCubemapToEquiImageData(
    renderer,
    renderTarget.texture,
    resolution,
    resolution
  ) as ImageData

  scene.environment = originalEnvironment

  return envmapImageData
}

const resolution = 1024

/**
 * Generates a low res cubemap at a specific position in the world for preview.
 *
 * @param position
 * @returns
 */
export const bakeEnvmapTexture = async (position: Vector3) => {
  const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!
  const previewCubemapCapturer = new CubemapCapturer(renderer, new Scene(), resolution)
  const renderTarget = previewCubemapCapturer.update(position)
  const bake = (await convertCubemapToEquiImageData(
    renderer,
    renderTarget.texture,
    resolution,
    resolution
  )) as ImageData
  return bake
}

/**
 * Generates and iploads a high res cubemap at a specific position in the world for saving and export.
 *
 * @param position
 * @returns
 */
export const uploadCubemapBakeToServer = async (name: string, data: ImageData) => {
  const blob = await convertImageDataToKTX2Blob(data)

  if (!blob) return null!

  const editorState = getState(EditorState)
  const sceneName = editorState.sceneName!
  const projectName = editorState.projectName!
  const filename = `${sceneName}-${name.replace(' ', '-')}.ktx2`
  const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')
  const urlList = await uploadProjectFiles(projectName, [new File([blob], filename)], [currentSceneDirectory])
    .promises[0]
  const url = urlList[0]

  return url
}
