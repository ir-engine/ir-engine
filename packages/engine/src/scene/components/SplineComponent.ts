import { Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SplineComponentType = {
  splinePositions: Vector3[]
}

export const SplineComponent = createMappedComponent<SplineComponentType>('SplineComponent')
