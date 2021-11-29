import { ParityValue } from '../../common/enums/ParityValue'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippableAttachmentPoint, EquippedStateUpdateSchema } from '../enums/EquippedEnums'

// TODO: refactor equippables

export const equipEntity = (
  equipperEntity: Entity,
  equippedEntity: Entity,
  attachmentPoint: EquippableAttachmentPoint = EquippableAttachmentPoint.RIGHT_HAND
): void => {
  if (!hasComponent(equipperEntity, EquipperComponent) && !hasComponent(equippedEntity, EquippedComponent)) {
    addComponent(equipperEntity, EquipperComponent, { equippedEntity, data: {} as any })
    addComponent(equippedEntity, EquippedComponent, { equipperEntity, attachmentPoint })
  }
}

export const unequipEntity = (equipperEntity: Entity): void => {
  console.log('unequip')
  const equipperComponent = getComponent(equipperEntity, EquipperComponent)
  if (!equipperComponent) return
  // removeComponent(equipperComponent.equippedEntity, EquippedComponent);
  console.log(equipperComponent)
  removeComponent(equipperEntity, EquipperComponent)
}

export const getAttachmentPoint = (parityValue: ParityValue): EquippableAttachmentPoint => {
  let attachmentPoint = EquippableAttachmentPoint.RIGHT_HAND
  if (parityValue === ParityValue.LEFT) attachmentPoint = EquippableAttachmentPoint.LEFT_HAND

  return attachmentPoint
}

export const getParity = (attachmentPoint: EquippableAttachmentPoint): ParityValue => {
  let parityValue = ParityValue.RIGHT
  if (attachmentPoint === EquippableAttachmentPoint.LEFT_HAND) parityValue = ParityValue.LEFT

  return parityValue
}
