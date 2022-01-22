import { Vector2 } from 'three'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { InteriorComponent, InteriorComponentType } from '../../components/InteriorComponent'
import { resolveMedia } from '../../../common/functions/resolveMedia'
import { isClient } from '../../../common/functions/isClient'
import { Interior } from '../../classes/Interior'

export const SCENE_COMPONENT_INTERIOR = 'interior'
export const SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES = {
  cubeMap: '',
  tiling: 1,
  size: { x: 1, y: 1 }
}

export const deserializeInterior: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<InteriorComponentType>
) => {
  if (!isClient) return

  const obj3d = new Interior()
  const props = parseInteriorProperties(json.props)

  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, InteriorComponent, props)

  if (Engine.isEditor) {
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_INTERIOR)

    obj3d.userData.disableOutline = true
  }

  updateInterior(entity, props)
}

export const updateInterior: ComponentUpdateFunction = async (entity: Entity, properties: InteriorComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value as Interior
  const component = getComponent(entity, InteriorComponent)

  if (properties.cubeMap) {
    try {
      const { url } = await resolveMedia(component.cubeMap)
      obj3d.cubeMap = url
    } catch (error) {
      console.error(error)
    }
  }

  if (typeof properties.tiling !== 'undefined') obj3d.tiling = component.tiling
  if (typeof properties.size !== 'undefined') obj3d.size = component.size
}

export const serializeInterior: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, InteriorComponent) as InteriorComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_INTERIOR,
    props: {
      cubeMap: component.cubeMap,
      tiling: component.tiling,
      size: component.size
    }
  }
}

const parseInteriorProperties = (props): InteriorComponentType => {
  const result = {
    cubeMap: props.cubeMap ?? SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES.cubeMap,
    tiling: props.tiling ?? SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES.tiling
  } as InteriorComponentType

  const tempV2 = result.size ?? SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES.size
  result.size = new Vector2(tempV2.x, tempV2.y)

  return result
}
