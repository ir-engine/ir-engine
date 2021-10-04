import { Entity } from '../../ecs/Entity'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type CopyTransformComponentType = {
  input: Entity
}

export const CopyTransformComponent = createMappedComponent<CopyTransformComponentType>('CopyTransformComponent')
