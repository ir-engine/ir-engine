import { createMappedComponent } from '../ecs/functions/EntityFunctions'
import { GeoLabelNode } from './GeoLabelNode'

type ComponentType = {
  value: Set<GeoLabelNode>
}

export const GeoLabelSetComponent = createMappedComponent<ComponentType>()
