import { Entity } from '../ecs/classes/Entity'
import { createMappedComponent } from '../ecs/functions/ComponentFunctions'

export const DebugAutoPilotComponent = createMappedComponent<{
  navMeshEntity: Entity
  polygonPath: number[]
}>('DebugAutoPilotComponent')
