import { Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three'
import { beforeMaterialCompile } from '@xrengine/engine/src/scene/classes/BPCEMShader'
import CubemapCapturer from '@xrengine/engine/src/scene/classes/CubemapCapturer'
import { convertCubemapToEquiImageData } from '@xrengine/engine/src/scene/classes/ImageUtils'
import { uploadProjectFile } from './assetFunctions'
import { accessEditorState } from '../services/EditorServices'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CubemapBakeComponent } from '@xrengine/engine/src/scene/components/CubemapBakeComponent'
import {
  parseCubemapBakeProperties,
  prepareSceneForBake,
  SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES,
  updateCubemapBake,
  updateCubemapBakeTexture
} from '@xrengine/engine/src/scene/functions/loaders/CubemapBakeFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { ScenePreviewCameraTagComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

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

export const uploadBakeToServer = async (entity: Entity) => {
  const world = useWorld()
  const isSceneEntity = entity === world.entityTree.rootNode.entity

  if (isSceneEntity) {
    if (!hasComponent(entity, CubemapBakeComponent)) {
      addComponent(
        entity,
        CubemapBakeComponent,
        parseCubemapBakeProperties(SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES)
      )
      updateCubemapBake(entity)
    }
  }

  const bakeComponent = getComponent(entity, CubemapBakeComponent)
  const position = getScenePositionForBake(world, isSceneEntity ? null : entity)

  // inject bpcem logic into material
  Engine.scene.traverse((child: Mesh<any, MeshBasicMaterial>) => {
    if (!child.material) return
    if (typeof child.material.onBeforeCompile === 'function')
      child.material.userData.previousOnBeforeCompile = child.material.onBeforeCompile
    child.material.onBeforeCompile = beforeMaterialCompile(
      bakeComponent.options.bakeScale,
      bakeComponent.options.bakePositionOffset
    )
  })

  const cubemapCapturer = new CubemapCapturer(Engine.renderer, Engine.scene, bakeComponent.options.resolution)
  const renderTarget = cubemapCapturer.update(position)

  // remove injected bpcem logic from material
  Engine.scene.traverse((child: Mesh<any, MeshBasicMaterial>) => {
    if (!child.material) return
    if (typeof child.material.userData.previousOnBeforeCompile === 'function') {
      child.material.onBeforeCompile = child.material.userData.previousOnBeforeCompile
      delete child.material.userData.previousOnBeforeCompile
    }
  })

  Engine.scene.environment = renderTarget.texture

  const { blob } = await convertCubemapToEquiImageData(
    Engine.renderer,
    renderTarget,
    bakeComponent.options.resolution,
    bakeComponent.options.resolution,
    true
  )

  if (!blob) return null!

  const nameComponent = getComponent(entity, NameComponent)
  const sceneName = accessEditorState().sceneName.value!
  const projectName = accessEditorState().projectName.value!
  const filename = isSceneEntity
    ? `${sceneName}.cubemap.png`
    : `${sceneName}-${nameComponent.name.replace(' ', '-')}.png`

  const value = await uploadProjectFile(projectName, [new File([blob], filename)])

  bakeComponent.options.envMapOrigin = value[0].url

  updateCubemapBakeTexture(bakeComponent.options)

  return value[0].url
}
