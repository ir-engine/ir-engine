import { Box3 } from 'three'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type BoundingBoxComponentType = {
  box: Box3
  dynamic: boolean
}

export const BoundingBoxComponent = createMappedComponent<BoundingBoxComponentType>('BoundingBoxComponent')
