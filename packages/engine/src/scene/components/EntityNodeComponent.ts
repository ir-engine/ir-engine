import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type EntityNodeComponentType = {
  components: string[]
}

export const EntityNodeComponent = createMappedComponent<EntityNodeComponentType>('EntityNodeComponent')
