import { Types } from 'bitecs'
import { Vector3 } from 'three'

import { proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export type VelocityComponentType = {
  linear: Vector3
  angular: Vector3
}

const { f32 } = Types
const Vector3Schema = { x: f32, y: f32, z: f32 }
const SCHEMA = {
  linear: Vector3Schema,
  angular: Vector3Schema
}

export const VelocityComponent = createMappedComponent<VelocityComponentType, typeof SCHEMA>(
  'VelocityComponent',
  SCHEMA
)

export const setVelocityComponent = (entity: Entity, linear = new Vector3(), angular = new Vector3()) => {
  setComponent(entity, VelocityComponent, {
    linear: proxifyVector3(VelocityComponent.linear, entity, linear),
    angular: proxifyVector3(VelocityComponent.angular, entity, angular)
  })
}
