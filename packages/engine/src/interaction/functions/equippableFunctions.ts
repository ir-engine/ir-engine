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
  // const equipperComponent = getComponent(equipperEntity, EquipperComponent);
  // if(!equipperComponent) return;
  // removeComponent(equipperComponent.equippedEntity, EquippedComponent);
  // removeComponent(equipperEntity, EquipperComponent);
}
