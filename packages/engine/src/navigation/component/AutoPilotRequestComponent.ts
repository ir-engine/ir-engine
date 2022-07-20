import { Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AutoPilotRequestComponentType = {
  navEntity: Entity
  point: Vector3
}

export const AutoPilotRequestComponent =
  createMappedComponent<AutoPilotRequestComponentType>('AutoPilotRequestComponent')
