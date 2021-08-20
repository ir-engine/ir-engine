import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type TransformParentComponentType = {
  children: any[]
}

export const TransformParentComponent = createMappedComponent<TransformParentComponentType>()
