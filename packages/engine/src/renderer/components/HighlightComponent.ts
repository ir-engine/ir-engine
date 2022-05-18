import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type HighlightComponentType = {}

export const HighlightComponent = createMappedComponent<HighlightComponentType>('HighlightComponent')
