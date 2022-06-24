import { Mesh, MeshBasicMaterial, Vector3 } from 'three'

import { addOBCPlugin, removeOBCPlugin } from '@xrengine/engine/src/common/functions/OnBeforeCompilePlugin'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { beforeMaterialCompile } from '@xrengine/engine/src/scene/classes/BPCEMShader'
import CubemapCapturer from '@xrengine/engine/src/scene/classes/CubemapCapturer'
import { convertCubemapToEquiImageData } from '@xrengine/engine/src/scene/classes/ImageUtils'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { EnvMapBakeComponent } from '@xrengine/engine/src/scene/components/EnvMapBakeComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { ScenePreviewCameraTagComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import {
  parseEnvMapBakeProperties,
  SCENE_COMPONENT_ENVMAP_BAKE,
  SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES,
  updateEnvMapBake
} from '@xrengine/engine/src/scene/functions/loaders/EnvMapBakeFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { accessEditorState } from '../services/EditorServices'
import { uploadProjectFile } from './assetFunctions'

const query = defineQuery([ScenePreviewCameraTagComponent, TransformComponent])

const getScenePositionForBake = (world: World, entity: Entity | null) => {
  if (entity) {
    const transformComponent = getComponent(entity, TransformComponent)
    return transformComponent.position
  }
  let entityToBakeFrom: Entity
  entityToBakeFrom = query(world)[0]

  // fall back somewhere behind the world origin
  if (entityToBakeFrom) {
    const transformComponent = getComponent(entityToBakeFrom, TransformComponent)
    if (transformComponent?.position) return transformComponent.position
  }
  return new Vector3(0, 2, 5)
}

/**
 * Uploads a envmap for a specific entity to the current project
 * If the entity provided is the root node for the scene, it will set this as the environment map
 *
 * TODO: make this not the default behavior, instead we want an option in the envmap properties of the scene node,
 *   which will dictate where the envmap is source from see issue #5751
 *
 * @param entity
 * @returns
 */

export const uploadBakeToServer = async (entity: Entity) => {
  const world = Engine.instance.currentWorld
  const isSceneEntity = entity === world.entityTree.rootNode.entity

  if (isSceneEntity) {
    if (!hasComponent(entity, EnvMapBakeComponent)) {
      addComponent(entity, EnvMapBakeComponent, parseEnvMapBakeProperties(SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES))
      getComponent(entity, EntityNodeComponent).components.push(SCENE_COMPONENT_ENVMAP_BAKE)
      updateEnvMapBake(entity)
    }
  }

  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  const position = getScenePositionForBake(world, isSceneEntity ? null : entity)

  // inject bpcem logic into material
  Engine.instance.currentWorld.scene.traverse((child: Mesh<any, MeshBasicMaterial>) => {
    if (!child.material) return
    child.material.userData.BPCEMPlugin = beforeMaterialCompile(
      bakeComponent.options.bakeScale,
      bakeComponent.options.bakePositionOffset
    )
    addOBCPlugin(child.material, child.material.userData.BPCEMPlugin)
  })

  const cubemapCapturer = new CubemapCapturer(
    EngineRenderer.instance.renderer,
    Engine.instance.currentWorld.scene,
    bakeComponent.options.resolution
  )
  const renderTarget = cubemapCapturer.update(position)

  // remove injected bpcem logic from material
  Engine.instance.currentWorld.scene.traverse((child: Mesh<any, MeshBasicMaterial>) => {
    if (child.material && typeof child.material.userData.BPCEMPlugin === 'function') {
      removeOBCPlugin(child.material, child.material.userData.BPCEMPlugin)
      delete child.material.userData.BPCEMPlugin
    }
  })

  if (isSceneEntity) Engine.instance.currentWorld.scene.environment = renderTarget.texture

  const { blob } = await convertCubemapToEquiImageData(
    EngineRenderer.instance.renderer,
    renderTarget.texture,
    bakeComponent.options.resolution,
    bakeComponent.options.resolution,
    true
  )

  if (!blob) return null!

  const nameComponent = getComponent(entity, NameComponent)
  const sceneName = accessEditorState().sceneName.value!
  const projectName = accessEditorState().projectName.value!
  const filename = isSceneEntity
    ? `${sceneName}.envmap.png`
    : `${sceneName}-${nameComponent.name.replace(' ', '-')}.png`

  const value = await uploadProjectFile(projectName, [new File([blob], filename)])

  bakeComponent.options.envMapOrigin = value[0].url

  return value[0].url
}
