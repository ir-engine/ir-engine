import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type HighlightComponentType = {
  color: number
  hiddenColor: number
  edgeStrength: number
}

export const HighlightComponent = createMappedComponent<HighlightComponentType>('HighlightComponent')
