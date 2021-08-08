import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type TransformParentComponentType = {
  children: any[]
}

export const TransformParentComponent = createMappedComponent<TransformParentComponentType>()