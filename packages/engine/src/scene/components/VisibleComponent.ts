import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VisibleComponentType = {
  value: boolean
}

export const VisibleComponent = createMappedComponent<VisibleComponentType>('VisibleComponent')
