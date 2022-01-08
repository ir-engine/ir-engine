import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EquippableAttachmentPoint } from '../enums/EquippedEnums'

export type EquippedComponentType = {
  attachmentPoint: EquippableAttachmentPoint
  equipperEntity: Entity
}

export const EquippedComponent = createMappedComponent<EquippedComponentType>('EquippedComponent')
