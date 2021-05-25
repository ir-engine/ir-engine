import { Entity } from "../../ecs/classes/Entity"
import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions"
import { NetworkObject } from "../../networking/components/NetworkObject"
import { EquippedComponent } from "../components/EquippedComponent"
import { EquipperComponent } from "../components/EquipperComponent"
import { EquippableAttachmentPoint, EquippedStateUpdateSchema } from "../enums/EquippedEnums"

export const equipEntity = (equipperEntity: Entity, equippedEntity: Entity, attachmentPoint: EquippableAttachmentPoint = EquippableAttachmentPoint.RIGHT_HAND): void => {
  // console.log(getComponent(equippedEntity, NetworkObject)?.uniqueId, getComponent(equippedEntity, NetworkObject)?.networkId, getComponent(equippedEntity, NetworkObject)?.ownerId)
  // console.log(getComponent(equipperEntity, NetworkObject)?.uniqueId, getComponent(equipperEntity, NetworkObject)?.networkId, getComponent(equipperEntity, NetworkObject)?.ownerId)
  if(!hasComponent(equipperEntity, EquipperComponent) && hasComponent(equippedEntity, NetworkObject) && !hasComponent(equippedEntity, EquippedComponent)) {
    addComponent(equipperEntity, EquipperComponent, { equippedEntity, attachmentPoint });
    addComponent(equippedEntity, EquippedComponent, { equipperEntity });
  }
}

export const unequipEntity = (equipperEntity: Entity): void => {
  // const equipperComponent = getComponent(equipperEntity, EquipperComponent);
  // if(!equipperComponent) return;
  // removeComponent(equipperComponent.equippedEntity, EquippedComponent);
  // removeComponent(equipperEntity, EquipperComponent);
}