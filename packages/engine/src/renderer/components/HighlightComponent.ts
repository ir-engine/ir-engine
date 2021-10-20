import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type HighlightComponentType = {
  color: number
  hiddenColor: number
  edgeStrength: number
}

export const HighlightComponent = createMappedComponent<HighlightComponentType>('HighlightComponent')
