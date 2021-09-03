import { Vector2, Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author Josh Field <github.com/HexaField>
 */

export type AutoPilotClickRequestComponentType = {
  coords: Vector2
  overrideCoords?: boolean
  overridePosition?: Vector3
}

export const AutoPilotClickRequestComponent = createMappedComponent<AutoPilotClickRequestComponentType>()
