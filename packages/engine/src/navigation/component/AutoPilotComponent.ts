import { Vector3 } from 'three'
import { Path } from 'yuka'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AutoPilotComponentType = {
  endPoint: Vector3
  path: Path
  speed: number
  maxSpeed: number
  minSpeed: number
}

export const AutoPilotComponent = createMappedComponent<AutoPilotComponentType>('AutoPilotComponent')
