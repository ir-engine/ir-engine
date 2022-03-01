import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AutoPilotOverrideComponentType = {
  overrideCoords: boolean
  overridePosition: Vector3
}

export const AutoPilotOverrideComponent =
  createMappedComponent<AutoPilotOverrideComponentType>('AutoPilotOverrideComponent')
