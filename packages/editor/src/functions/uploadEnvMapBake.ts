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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Scene, Vector3 } from 'three'

import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
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
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { getNestedVisibleChildren, getSceneParameters } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { EditorState } from '../services/EditorServices'
import { uploadProjectFiles } from './assetFunctions'

const scenePreviewCameraQuery = defineQuery([ScenePreviewCameraComponent, TransformComponent])

/**
 * Gets the position for baking an environment map, using the provided entity, a scene preview camera, or a default position
 * @param entity The entity to get the position from
 * @returns The position for baking
 */
const getScenePositionForBake = (entity?: Entity) => {
  if (entity) {
    const transformComponent = getComponent(entity, TransformComponent)
    const position = new Vector3().copy(transformComponent.position)
    if (hasComponent(entity, EnvMapBakeComponent)) {
      const bakeComponent = getComponent(entity, EnvMapBakeComponent)
      const offset = new Vector3().copy(bakeComponent.bakePositionOffset)
      position.add(offset)
    }
    return position
  }

  const entityToBakeFrom = scenePreviewCameraQuery()[0]
  if (entityToBakeFrom) {
    const transformComponent = getComponent(entityToBakeFrom, TransformComponent)
    if (transformComponent?.position) return new Vector3().copy(transformComponent.position)
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
 * @returns The URL of the uploaded environment map, or null if the operation failed
 */
export const uploadBPCEMBakeToServer = async (entity: Entity) => {
  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  const bakePosition = getScenePositionForBake(entity)
  const isSceneRootEntity = entity === getState(EditorState).rootEntity

  const envmapImageData = generateEnvmapBake({
    entity,
    position: bakePosition,
    resolution: bakeComponent.resolution
  })

  const envmap = await convertImageDataToKTX2Blob(envmapImageData)
  if (!envmap) return null!

  const nameComponent = getComponent(entity, NameComponent)
  const editorState = getState(EditorState)
  const sceneName = editorState.sceneName!
  const projectName = editorState.projectName!
  const filename = isSceneRootEntity
    ? `${sceneName}.envmap.ktx2`
    : `${sceneName}-${nameComponent.replace(' ', '-')}.ktx2`

  const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')
  const url = (
    await uploadProjectFiles(projectName, [new File([envmap], filename)], [currentSceneDirectory]).promises[0]
  )[0]

  const cleanURL = new URL(url)

  setComponent(entity, EnvMapBakeComponent, { envMapOrigin: cleanURL.href })
}

/**
 * Generates an environment map of the given resolution at a specific position, or from the entity's position
 * @todo replace resolution with LODs
 * @param options Configuration options for the environment map generation
 * @returns ImageData of the generated environment map
 */
export const generateEnvmapBake = (
  options: {
    entity?: Entity
    position?: Vector3
    resolution?: number
  } = {}
) => {
  const { entity, position, resolution = 2048 } = options

  const cubemapPosition = position
    ? new Vector3().copy(position)
    : entity
    ? getScenePositionForBake(entity)
    : getScenePositionForBake()

  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  const renderer = getComponent(viewerEntity, RendererComponent).renderer!

  const rootEntity = getState(EditorState).rootEntity
  const entitiesToRender = getNestedVisibleChildren(rootEntity)
  const sceneData = getSceneParameters(entitiesToRender, viewerEntity)
  const scene = new Scene()
  scene.children = sceneData.children
  scene.background = sceneData.background
  scene.fog = sceneData.fog
  scene.environment = sceneData.environment

  const cubemapCapturer = new CubemapCapturer(renderer, scene, resolution)
  const renderTarget = cubemapCapturer.update(cubemapPosition)

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
 * Generates and uploads a high res cubemap at a specific position in the world for saving and export.
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
