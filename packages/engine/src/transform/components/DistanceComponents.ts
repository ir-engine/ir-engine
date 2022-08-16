import { Types } from 'bitecs'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export const DistanceComponentSchema = { squaredDistance: Types.f32 }

export const DistanceFromLocalClientComponent = createMappedComponent<{}, typeof DistanceComponentSchema>(
  'DistanceComponent',
  DistanceComponentSchema
)
export const DistanceFromCameraComponent = createMappedComponent<{}, typeof DistanceComponentSchema>(
  'DistanceComponent',
  DistanceComponentSchema
)

export function setDistanceFromLocalClientComponent(entity: Entity) {
  setComponent(entity, DistanceFromLocalClientComponent, {})
}

export function setDistanceFromCameraComponent(entity: Entity) {
  setComponent(entity, DistanceFromCameraComponent, {})
}
