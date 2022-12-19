import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type EquippedComponentType = {
  attachmentPoint: XRHandedness
  equipperEntity: Entity
}

export const EquippedComponent = createMappedComponent<EquippedComponentType>('EquippedComponent')
