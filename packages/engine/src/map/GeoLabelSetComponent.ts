import { createMappedComponent } from '../ecs/functions/ComponentFunctions'
import { GeoLabelNode } from './GeoLabelNode'

// TODO delete this file

type ComponentType = {
  value: Set<GeoLabelNode>
}

export const GeoLabelSetComponent = createMappedComponent<ComponentType>('GeoLabelSetComponent')
