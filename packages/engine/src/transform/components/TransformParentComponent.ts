import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type TransformParentComponentType = {
  children: any[]
}

export const TransformParentComponent = createMappedComponent<TransformParentComponentType>('TransformParentComponent')
