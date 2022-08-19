import { Vector2 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AutoPilotRequestComponentType = {
  unprojectedPoint: Vector2
}

export const AutoPilotRequestComponent =
  createMappedComponent<AutoPilotRequestComponentType>('AutoPilotRequestComponent')
