import { Box3 } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

type BoundingBoxComponentType = {
  box: Box3
  dynamic: boolean
}

export const BoundingBoxComponent = createMappedComponent<BoundingBoxComponentType>()