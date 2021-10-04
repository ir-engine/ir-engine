import { Entity } from '../../ecs/Entity'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type EquipperComponentType = {
  equippedEntity: Entity
  data: any
}

export const EquipperComponent = createMappedComponent<EquipperComponentType>('EquipperComponent')
