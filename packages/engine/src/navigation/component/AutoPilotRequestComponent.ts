import { Entity } from '../../ecs/Entity'
import { Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

/**
 * @author xiani_zp <github.com/xiani>
 */

export type AutoPilotRequestComponentType = {
  navEntity: Entity
  point: Vector3
}

export const AutoPilotRequestComponent =
  createMappedComponent<AutoPilotRequestComponentType>('AutoPilotRequestComponent')
