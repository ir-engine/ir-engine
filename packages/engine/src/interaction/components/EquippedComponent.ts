import { Entity } from '../../ecs/Entity'
import { EquippableAttachmentPoint } from '../enums/EquippedEnums'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type EquippedComponentType = {
  attachmentPoint: EquippableAttachmentPoint
  equipperEntity: Entity
}

export const EquippedComponent = createMappedComponent<EquippedComponentType>('EquippedComponent')
