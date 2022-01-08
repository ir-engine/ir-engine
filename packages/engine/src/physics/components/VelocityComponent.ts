import { Types } from 'bitecs'
import { create } from 'lodash'
import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type VelocityComponentType = {
  velocity: Vector3
}

const { f32 } = Types
const Vector3Schema = { x: f32, y: f32, z: f32 }
const SCHEMA = {
  velocity: Vector3Schema
}

export const VelocityComponent = createMappedComponent<VelocityComponentType, typeof SCHEMA>(
  'VelocityComponent',
  SCHEMA
)
