import { Vector2 } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { Interior } from '../../classes/Interior'
import { addObjectToGroup } from '../../components/GroupComponent'
import {
  InteriorComponent,
  InteriorComponentType,
  SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES
} from '../../components/InteriorComponent'
import { addError, removeError } from '../ErrorFunctions'

export const deserializeInterior: ComponentDeserializeFunction = (entity: Entity, data: InteriorComponentType) => {
  const props = parseInteriorProperties(data)
  setComponent(entity, InteriorComponent, props)
}

export const updateInterior: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, InteriorComponent)

  if (!component.interior) {
    component.interior = new Interior(entity)
    addObjectToGroup(entity, component.interior)
  }

  const obj3d = component.interior
  if (obj3d.cubeMap !== component.cubeMap) {
    try {
      obj3d.cubeMap = component.cubeMap
      removeError(entity, 'error')
    } catch (error) {
      addError(entity, 'error', error.message)
    }
  }

  obj3d.tiling = component.tiling
  obj3d.size = component.size
}

export const serializeInterior: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, InteriorComponent) as InteriorComponentType
  return {
    cubeMap: component.cubeMap,
    tiling: component.tiling,
    size: component.size
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
