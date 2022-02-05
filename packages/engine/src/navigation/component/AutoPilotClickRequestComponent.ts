import { Vector2 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * @author Josh Field <github.com/HexaField>
 */

export type AutoPilotClickRequestComponentType = {
  coords: Vector2
}

export const AutoPilotClickRequestComponent = createMappedComponent<AutoPilotClickRequestComponentType>(
  'AutoPilotClickRequestComponent'
)
