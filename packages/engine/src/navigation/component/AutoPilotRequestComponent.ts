import { Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * @author xiani_zp <github.com/xiani>
 */

export type AutoPilotRequestComponentType = {
  navEntity: Entity
  point: Vector3
}

export const AutoPilotRequestComponent =
  createMappedComponent<AutoPilotRequestComponentType>('AutoPilotRequestComponent')
