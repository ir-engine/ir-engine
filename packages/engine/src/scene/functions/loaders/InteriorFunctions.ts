import { Vector2 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Interior } from '../../classes/Interior'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { InteriorComponent, InteriorComponentType } from '../../components/InteriorComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { addError, removeError } from '../ErrorFunctions'

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

  const obj3d = new Interior(entity)
  obj3d.userData.disableOutline = true
  const props = parseInteriorProperties(json.props)

  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, InteriorComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_INTERIOR)

  updateInterior(entity, props)
}

export const updateInterior: ComponentUpdateFunction = (entity: Entity, properties: InteriorComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value as Interior
  const component = getComponent(entity, InteriorComponent)

  if (properties.cubeMap) {
    try {
      obj3d.cubeMap = component.cubeMap
      removeError(entity, 'error')
    } catch (error) {
      addError(entity, 'error', error.message)
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
