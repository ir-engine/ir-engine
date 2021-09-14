import { Body } from '../../physics/physx'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type ColliderComponentType = {
  body: Body
}

export const ColliderComponent = createMappedComponent<ColliderComponentType>('ColliderComponent')
