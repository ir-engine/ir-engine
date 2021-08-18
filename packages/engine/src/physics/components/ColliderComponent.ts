import PhysX from 'three-physx'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type ColliderComponentType = {
  body: PhysX.Body
}

export const ColliderComponent = createMappedComponent<ColliderComponentType>()
