import { Box3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type BoundingBoxComponentType = {
  box: Box3
}

export const BoundingBoxComponent = createMappedComponent<BoundingBoxComponentType>('BoundingBoxComponent')
