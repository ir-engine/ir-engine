import { Entity } from '../../ecs/classes/Entity'
import { EquippableAttachmentPoint } from '../enums/EquippedEnums'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type EquippedComponentType = {
  attachmentPoint: EquippableAttachmentPoint
  equipperEntity: Entity
}

export const EquippedComponent = createMappedComponent<EquippedComponentType>('EquippedComponent')
