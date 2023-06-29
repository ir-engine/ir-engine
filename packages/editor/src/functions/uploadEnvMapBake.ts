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

import { Vector3 } from 'three'

import { addOBCPlugin, removeOBCPlugin } from '@etherealengine/engine/src/common/functions/OnBeforeCompilePlugin'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  defineQuery,
  getComponent,
  hasComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import CubemapCapturer from '@etherealengine/engine/src/scene/classes/CubemapCapturer'
import { convertCubemapToKTX2 } from '@etherealengine/engine/src/scene/classes/ImageUtils'
import { EnvMapBakeComponent } from '@etherealengine/engine/src/scene/components/EnvMapBakeComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'

import { EditorState } from '../services/EditorServices'
import { uploadProjectFiles } from './assetFunctions'

const query = defineQuery([ScenePreviewCameraComponent, TransformComponent])

const getScenePositionForBake = (entity: Entity | null) => {
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
  const isSceneEntity = entity === getState(SceneState).sceneEntity

  if (isSceneEntity) {
    if (!hasComponent(entity, EnvMapBakeComponent)) {
      setComponent(entity, EnvMapBakeComponent)
    }
  }

  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  const position = getScenePositionForBake(isSceneEntity ? null : entity)

  const cubemapCapturer = new CubemapCapturer(
    EngineRenderer.instance.renderer,
    Engine.instance.scene,
    bakeComponent.resolution
  )
  const renderTarget = cubemapCapturer.update(position)

  if (isSceneEntity) Engine.instance.scene.environment = renderTarget.texture

  const blob = await convertCubemapToKTX2(
    EngineRenderer.instance.renderer,
    renderTarget.texture,
    bakeComponent.resolution,
    bakeComponent.resolution,
    true
  )

  if (!blob) return null!

  const nameComponent = getComponent(entity, NameComponent)
  const editorState = getState(EditorState)
  const sceneName = editorState.sceneName!
  const projectName = editorState.projectName!
  const filename = isSceneEntity ? `${sceneName}.envmap.ktx2` : `${sceneName}-${nameComponent.replace(' ', '-')}.ktx2`

  const url = (await uploadProjectFiles(projectName, [new File([blob], filename)]).promises[0])[0]

  setComponent(entity, EnvMapBakeComponent, { envMapOrigin: url })

  return url
}

const resolution = 1024

/**
 * Generates and uploads a cubemap at a specific position in the world.
 *
 * @param entity
 * @returns
 */

export const uploadCubemapBakeToServer = async (name: string, position: Vector3) => {
  const cubemapCapturer = new CubemapCapturer(EngineRenderer.instance.renderer, Engine.instance.scene, resolution)
  const renderTarget = cubemapCapturer.update(position)

  const blob = (await convertCubemapToKTX2(
    EngineRenderer.instance.renderer,
    renderTarget.texture,
    resolution,
    resolution,
    true
  )) as Blob

  if (!blob) return null!

  const editorState = getState(EditorState)
  const sceneName = editorState.sceneName!
  const projectName = editorState.projectName!
  const filename = `${sceneName}-${name.replace(' ', '-')}.ktx2`

  const url = (await uploadProjectFiles(projectName, [new File([blob], filename)])[0])[0]

  return url
}
