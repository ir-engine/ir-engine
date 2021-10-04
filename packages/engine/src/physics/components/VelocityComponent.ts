import { Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type VelocityComponentType = {
  velocity: Vector3
}

export const VelocityComponent = createMappedComponent<VelocityComponentType>('VelocityComponent')
