import { Mesh, MeshStandardMaterial, Object3D, Quaternion, Scene, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '../../../ecs/functions/EntityTreeFunctions'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { EnvMapBakeComponent, EnvMapBakeComponentType } from '../../components/EnvMapBakeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'
import { EnvMapBakeRefreshTypes } from '../../types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '../../types/EnvMapBakeTypes'

export const SCENE_COMPONENT_ENVMAP_BAKE = 'envmapbake'
export const SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES = {
  options: {
    bakePosition: { x: 0, y: 0, z: 0 },
    bakePositionOffset: { x: 0, y: 0, z: 0 },
    bakeScale: { x: 1, y: 1, z: 1 },
    bakeType: EnvMapBakeTypes.Baked,
    resolution: 2048,
    refreshMode: EnvMapBakeRefreshTypes.OnAwake,
    envMapOrigin: '',
    boxProjection: true
  }
}

export const deserializeEnvMapBake: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<EnvMapBakeComponentType>
) => {
  const props = parseEnvMapBakeProperties(json.props)
  addComponent(entity, EnvMapBakeComponent, props)
  addComponent(entity, PreventBakeTagComponent, true)
}

export const serializeEnvMapBake: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, EnvMapBakeComponent) as EnvMapBakeComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_ENVMAP_BAKE,
    props: {
      options: component.options
    }
  }
}

export const prepareSceneForBake = (world = useWorld()): Scene => {
  const scene = Engine.instance.currentWorld.scene.clone(false)
  const parents = {
    [world.entityTree.rootNode.entity]: scene
  } as { [key: Entity]: Object3D }

  traverseEntityNode(world.entityTree.rootNode, (node) => {
    if (node === world.entityTree.rootNode || hasComponent(node.entity, PreventBakeTagComponent)) return

    const obj3d = getComponent(node.entity, Object3DComponent)?.value as Mesh<any, MeshStandardMaterial>

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
    options: {
      bakeType: props.options.bakeType ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.options.bakeType,
      resolution: props.options.resolution ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.options.resolution,
      refreshMode: props.options.refreshMode ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.options.refreshMode,
      envMapOrigin: props.options.envMapOrigin ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.options.envMapOrigin,
      boxProjection: props.options.boxProjection ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.options.boxProjection
    }
  } as EnvMapBakeComponentType

  let tempV3 = props.options.bakePosition ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.options.bakePosition
  result.options.bakePosition = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.options.bakePositionOffset ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.options.bakePositionOffset
  result.options.bakePositionOffset = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.options.bakeScale ?? SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES.options.bakeScale
  result.options.bakeScale = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  return result
}
