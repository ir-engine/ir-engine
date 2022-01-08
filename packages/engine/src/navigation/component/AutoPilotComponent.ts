import { Path } from 'yuka'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * @author xiani_zp <github.com/xiani>
 */

export type AutoPilotComponentType = {
  navEntity: Entity
  path: Path
}

export const AutoPilotComponent = createMappedComponent<AutoPilotComponentType>('AutoPilotComponent')
