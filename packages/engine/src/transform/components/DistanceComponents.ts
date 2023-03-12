import { Types } from 'bitecs'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export const DistanceComponentSchema = { squaredDistance: Types.f32 }

export const DistanceFromLocalClientComponent = defineComponent({
  name: 'DistanceFromLocalClientComponent',
  schema: DistanceComponentSchema
})
export const DistanceFromCameraComponent = defineComponent({
  name: 'DistanceFromCameraComponent',
  schema: DistanceComponentSchema
})

export const FrustumCullCameraSchema = { isCulled: Types.ui8 }
export const FrustumCullCameraComponent = defineComponent({
  name: 'FrustumCullCameraComponent',
  schema: FrustumCullCameraSchema
})

export function setDistanceFromLocalClientComponent(entity: Entity) {
  setComponent(entity, DistanceFromLocalClientComponent)
}

export function setDistanceFromCameraComponent(entity: Entity) {
  setComponent(entity, DistanceFromCameraComponent)
}

export const compareDistance = (a: Entity, b: Entity) => {
  const aDist = DistanceFromCameraComponent.squaredDistance[a]
  const bDist = DistanceFromCameraComponent.squaredDistance[b]
  return aDist - bDist
}
