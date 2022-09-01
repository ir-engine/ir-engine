import { Vector3 } from 'three'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { SplineComponent, SplineComponentType } from '../../components/SplineComponent'

export const deserializeSpline: ComponentDeserializeFunction = (entity: Entity, data: SplineComponentType) => {
  const props = parseSplineProperties(data)
  setComponent(entity, SplineComponent, props)
}

export const serializeSpline: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, SplineComponent)
  return {
    splinePositions: component.splinePositions
  }
}

export const parseSplineProperties = (props: any): SplineComponentType => {
  const result = { splinePositions: [] as Vector3[] }

  if (!props.splinePositions) return result

  props.splinePositions.forEach((pos) => result.splinePositions.push(new Vector3(pos.x, pos.y, pos.z)))

  return result
}
