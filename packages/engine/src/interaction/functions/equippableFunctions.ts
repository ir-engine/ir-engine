import { Vector3 } from "three"
import { BinaryValue } from "../../common/enums/BinaryValue"
import { isServer } from "../../common/functions/isServer"
import { Entity } from "../../ecs/classes/Entity"
import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions"
import { NetworkObject } from "../../networking/components/NetworkObject"
import { sendClientObjectUpdate } from "../../networking/functions/sendClientObjectUpdate"
import { ColliderComponent } from "../../physics/components/ColliderComponent"
import { NetworkObjectUpdateType } from "../../templates/networking/NetworkObjectUpdateSchema"
import { TransformChildComponent } from "../../transform/components/TransformChildComponent"
import { EquippedComponent } from "../components/EquippedComponent"
import { EquippedStateUpdateSchema } from "../enums/EquippedEnums"

export const equipEntity = (equipperEntity: Entity, equippedEntity: Entity): void => {
  if(hasComponent(equipperEntity, EquippedComponent)) return; // already equipped
  addComponent(equipperEntity, EquippedComponent, { equippedEntity: equippedEntity })
  if(!hasComponent(equippedEntity, TransformChildComponent)) {
    addComponent(equippedEntity, TransformChildComponent, { parent: equipperEntity, offsetPosition: new Vector3(0, 1, 0) })
    console.log(equippedEntity)
    const collider = getComponent(equippedEntity, ColliderComponent)
    collider.collider.type = 2; //BODY_TYPES.KINEMATIC
    if(isServer) {
      sendClientObjectUpdate(equipperEntity, NetworkObjectUpdateType.ObjectEquipped, [BinaryValue.TRUE, getComponent(equippedEntity, NetworkObject).networkId] as EquippedStateUpdateSchema)
    }
    // console.log('equipped!')
  }
}

export const unequipEntity = (equipperEntity: Entity): void => {
  if(!hasComponent(equipperEntity, EquippedComponent)) return; // already unequipped
  const equippedComponent = getComponent(equipperEntity, EquippedComponent)
  const equippedEntity = equippedComponent.equippedEntity;
  removeComponent(equippedEntity, TransformChildComponent)
  removeComponent(equipperEntity, EquippedComponent)
  const collider = getComponent(equippedEntity, ColliderComponent)
  collider.collider.type = 1; //BODY_TYPES.DYNAMIC
  if(isServer) {
    sendClientObjectUpdate(equipperEntity, NetworkObjectUpdateType.ObjectEquipped, [BinaryValue.FALSE] as EquippedStateUpdateSchema)
  }
  // console.log('unequipped!')
}