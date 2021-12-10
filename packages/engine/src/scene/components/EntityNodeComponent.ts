import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityNodeType } from '../constants/EntityNodeType'

export type EntityNodeComponentType = {
  type: EntityNodeType
  uuid: string
}

export const EntityNodeComponent = createMappedComponent<EntityNodeComponentType>('EntityNodeComponent')
