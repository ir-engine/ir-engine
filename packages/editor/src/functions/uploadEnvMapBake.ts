import { Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three'

import { addOBCPlugin, removeOBCPlugin } from '@etherealengine/engine/src/common/functions/OnBeforeCompilePlugin'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { beforeMaterialCompile } from '@etherealengine/engine/src/scene/classes/BPCEMShader'
import CubemapCapturer from '@etherealengine/engine/src/scene/classes/CubemapCapturer'
import { convertCubemapToEquiImageData } from '@etherealengine/engine/src/scene/classes/ImageUtils'
import { EnvMapBakeComponent } from '@etherealengine/engine/src/scene/components/EnvMapBakeComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { ScenePreviewCameraComponent } from '@etherealengine/engine/src/scene/components/ScenePreviewCamera'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

import { accessEditorState } from '../services/EditorServices'
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
  const world = Engine.instance.currentScene
  const isSceneEntity = entity === world.sceneEntity

  if (isSceneEntity) {
    if (!hasComponent(entity, EnvMapBakeComponent)) {
      setComponent(entity, EnvMapBakeComponent)
    }
  }

  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  const position = getScenePositionForBake(isSceneEntity ? null : entity)

  // inject bpcem logic into material
  Engine.instance.scene.traverse((child: Mesh<any, MeshBasicMaterial>) => {
    if (!child.material?.userData) return
    child.material.userData.BPCEMPlugin = beforeMaterialCompile(
      bakeComponent.bakeScale,
      bakeComponent.bakePositionOffset
    )
    addOBCPlugin(child.material, child.material.userData.BPCEMPlugin)
  })

  const cubemapCapturer = new CubemapCapturer(
    EngineRenderer.instance.renderer,
    Engine.instance.scene,
    bakeComponent.resolution
  )
  const renderTarget = cubemapCapturer.update(position)

  // remove injected bpcem logic from material
  Engine.instance.scene.traverse((child: Mesh<any, MeshBasicMaterial>) => {
    if (typeof child.material?.userData?.BPCEMPlugin === 'function') {
      removeOBCPlugin(child.material, child.material.userData.BPCEMPlugin)
      delete child.material.userData.BPCEMPlugin
    }
  })

  if (isSceneEntity) Engine.instance.scene.environment = renderTarget.texture

  const blob = (await convertCubemapToEquiImageData(
    EngineRenderer.instance.renderer,
    renderTarget.texture,
    bakeComponent.resolution,
    bakeComponent.resolution,
    true
  )) as Blob

  if (!blob) return null!

  const nameComponent = getComponent(entity, NameComponent)
  const sceneName = accessEditorState().sceneName.value!
  const projectName = accessEditorState().projectName.value!
  const filename = isSceneEntity ? `${sceneName}.envmap.png` : `${sceneName}-${nameComponent.replace(' ', '-')}.png`

  const url = (await uploadProjectFiles(projectName, [new File([blob], filename)]).promises[0])[0]

  bakeComponent.envMapOrigin = url

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

  const blob = (await convertCubemapToEquiImageData(
    EngineRenderer.instance.renderer,
    renderTarget.texture,
    resolution,
    resolution,
    true
  )) as Blob

  if (!blob) return null!

  const sceneName = accessEditorState().sceneName.value!
  const projectName = accessEditorState().projectName.value!
  const filename = `${sceneName}-${name.replace(' ', '-')}.png`

  const url = (await uploadProjectFiles(projectName, [new File([blob], filename)])[0])[0]

  return url
}
