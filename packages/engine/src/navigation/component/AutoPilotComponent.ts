import { Entity } from '../../ecs/Entity'
import { Path } from 'yuka'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

/**
 * @author xiani_zp <github.com/xiani>
 */

export type AutoPilotComponentType = {
  navEntity: Entity
  path: Path
}

export const AutoPilotComponent = createMappedComponent<AutoPilotComponentType>('AutoPilotComponent')
