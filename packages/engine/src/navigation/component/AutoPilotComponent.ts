import { Entity } from '../../ecs/classes/Entity'
import { Path } from 'yuka'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author xiani_zp <github.com/xiani>
 */

export type AutoPilotComponentType = {
  navEntity: Entity
  path: Path
}

export const AutoPilotComponent = createMappedComponent<AutoPilotComponentType>()
