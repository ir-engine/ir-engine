import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformParentComponentType = {
  children: any[]
}

export const TransformParentComponent = createMappedComponent<TransformParentComponentType>('TransformParentComponent')
