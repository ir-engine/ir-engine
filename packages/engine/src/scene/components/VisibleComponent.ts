import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type VisibleComponentType = {
  value: boolean
}

export const VisibleComponent = createMappedComponent<VisibleComponentType>('VisibleComponent')
