import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type HighlightComponentType = {
  color: number
  hiddenColor: number
  edgeStrength: number
}

export const HighlightComponent = createMappedComponent<HighlightComponentType>()