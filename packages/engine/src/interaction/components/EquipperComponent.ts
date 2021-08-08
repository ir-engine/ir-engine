import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type EquipperComponentType = {
  equippedEntity: Entity
  data: any
}

export const EquipperComponent = createMappedComponent<EquipperComponentType>()