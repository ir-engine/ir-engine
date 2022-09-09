import { Mesh, MeshStandardMaterial, Object3D, Scene, Vector3 } from 'three'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '../../../ecs/functions/EntityTreeFunctions'
import {
  EnvMapBakeComponent,
  EnvMapBakeComponentType,
  SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES
} from '../../components/EnvMapBakeComponent'
import { GroupComponent } from '../../components/GroupComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'

export const deserializeEnvMapBake: ComponentDeserializeFunction = (entity: Entity, data: EnvMapBakeComponentType) => {
  const props = parseEnvMapBakeProperties(data)
  setComponent(entity, EnvMapBakeComponent, props)
}

export const serializeEnvMapBake: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, EnvMapBakeComponent)
  return { ...component }
}

export const prepareSceneForBake = (world = Engine.instance.currentWorld): Scene => {
  const scene = world.scene.clone(false)
  const parents = {
    [world.entityTree.rootNode.entity]: scene
  } as { [key: Entity]: Object3D }

  traverseEntityNode(world.entityTree.rootNode, (node) => {
    if (node === world.entityTree.rootNode || hasComponent(node.entity, PreventBakeTagComponent)) return

    const obj3d = getComponent(node.entity, GroupComponent)?.value as unknown as Mesh<any, MeshStandardMaterial>

    if (obj3d) {
      const newObj = obj3d.clone(false)
      if (newObj.material) {
        newObj.material = obj3d.material.clone()
        newObj.material.roughness = 1
      }
      if (node.parentEntity) parents[node.parentEntity].add(newObj)
      parents[node.entity] = newObj
    }
  })

  return scene
}

export const parseEnvMapBakeProperties = (props): EnvMapBakeComponentType => {
  const result = {
    bakeType: props.bakeType ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.bakeType,
    resolution: props.resolution ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.resolution,
    refreshMode: props.refreshMode ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.refreshMode,
    envMapOrigin: props.envMapOrigin ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.envMapOrigin,
    boxProjection: props.boxProjection ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.boxProjection
  } as EnvMapBakeComponentType

  let tempV3 = props.bakePosition ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.bakePosition
  result.bakePosition = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.bakePositionOffset ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.bakePositionOffset
  result.bakePositionOffset = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.bakeScale ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.bakeScale
  result.bakeScale = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  return result
}
