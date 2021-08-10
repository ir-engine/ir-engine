import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type VisibleComponentType = {
  value: boolean
}

export const VisibleComponent = createMappedComponent<VisibleComponentType>()
