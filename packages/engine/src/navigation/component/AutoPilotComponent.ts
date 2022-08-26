import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AutoPilotComponentType = {
  // TODO remove this property?
  endPoint: Vector3
  path: Vector3[]
  pathIndex: number
  speed: number
  maxSpeed: number
  minSpeed: number
}

export const AutoPilotComponent = createMappedComponent<AutoPilotComponentType>('AutoPilotComponent')
