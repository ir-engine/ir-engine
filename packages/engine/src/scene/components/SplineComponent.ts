import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SplineComponentType = {
  splinePositions: Vector3[]
}

export const SplineComponent = createMappedComponent<SplineComponentType>('SplineComponent')

export const SCENE_COMPONENT_SPLINE = 'spline'
export const SCENE_COMPONENT_SPLINE_DEFAULT_VALUES = {
  splinePositions: [] as Vector3[]
}
