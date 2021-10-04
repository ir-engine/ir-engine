import { createMappedComponent } from '../ecs/ComponentFunctions'
import { GeoLabelNode } from './GeoLabelNode'

type ComponentType = {
  value: Set<GeoLabelNode>
}

export const GeoLabelSetComponent = createMappedComponent<ComponentType>('GeoLabelSetComponent')
