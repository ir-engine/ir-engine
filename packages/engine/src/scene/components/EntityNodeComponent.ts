import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type EntityNodeComponentType = {
  uuid: string
}

export const EntityNodeComponent = createMappedComponent<EntityNodeComponentType>('EntityNodeComponent')
