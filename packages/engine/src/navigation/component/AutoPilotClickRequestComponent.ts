import { Vector2 } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author Josh Field <github.com/HexaField>
 */

type AutoPilotClickRequestComponentType = {
  coords: Vector2
}

export const AutoPilotClickRequestComponent = createMappedComponent<AutoPilotClickRequestComponentType>()