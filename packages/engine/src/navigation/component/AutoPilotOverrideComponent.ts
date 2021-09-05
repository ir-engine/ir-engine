import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import { Vector3 } from 'three'

export type AutoPilotOverrideComponentType = {
  overrideCoords: boolean
  overridePosition: Vector3
}

export const AutoPilotOverrideComponent = createMappedComponent<AutoPilotOverrideComponentType>()
