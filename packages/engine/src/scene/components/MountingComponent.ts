import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type MountingComponentType = {
  mountPointEntity: Entity
}

export const MountingComponent = createMappedComponent<MountingComponentType>('MountingComponent')
