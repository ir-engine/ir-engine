import { Object3D, Quaternion, Vector3 } from "three"
import { BinaryValue } from "../../common/enums/BinaryValue"
import { isServer } from "../../common/functions/isServer"
import { Entity } from "../../ecs/classes/Entity"
import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions"
import { NetworkObject } from "../../networking/components/NetworkObject"
import { sendClientObjectUpdate } from "../../networking/functions/sendClientObjectUpdate"
import { ColliderComponent } from "../../physics/components/ColliderComponent"
import { BodyType } from "three-physx"
import { PhysicsSystem } from "../../physics/systems/PhysicsSystem"
import { NetworkObjectUpdateType } from "../../networking/templates/NetworkObjectUpdateSchema"
import { TransformChildComponent } from "../../transform/components/TransformChildComponent"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { EquippedComponent } from "../components/EquippedComponent"
import { EquippableAttachmentPoint, EquippedStateUpdateSchema } from "../enums/EquippedEnums"
import { Object3DComponent } from "../../scene/components/Object3DComponent"

export const equipEntity = (equipperEntity: Entity, equippedEntity: Entity, attachmentObject?: Object3D, attachmentTransform?: { position: Vector3, rotation: Quaternion }): void => {

  if(hasComponent(equipperEntity, EquippedComponent) || !hasComponent(equippedEntity, NetworkObject)) return; // already equipped or has no collider

  addComponent(equipperEntity, EquippedComponent, { equippedEntity: equippedEntity, attachmentPoint: EquippableAttachmentPoint.RIGHT_HAND });
  
  // all equippables must have a collider to grab by in VR
  const collider = getComponent(equippedEntity, ColliderComponent)
  collider.body.type = BodyType.KINEMATIC;
  // send equip to clients
  if(isServer) {
    const networkObject = getComponent(equippedEntity, NetworkObject)
    sendClientObjectUpdate(equipperEntity, NetworkObjectUpdateType.ObjectEquipped, [BinaryValue.TRUE, networkObject.networkId] as EquippedStateUpdateSchema)
  }
}

export const unequipEntity = (equipperEntity: Entity): void => {
  if(!hasComponent(equipperEntity, EquippedComponent)) return; // already unequipped
  const equippedComponent = getComponent(equipperEntity, EquippedComponent)
  const equippedEntity = equippedComponent.equippedEntity;
  const equippedTransform = getComponent(equippedEntity, TransformComponent)
  const collider = getComponent(equippedEntity, ColliderComponent)
  collider.body.type = BodyType.DYNAMIC;
  collider.body.updateTransform({
    translation: { x: equippedTransform.position.x, y: equippedTransform.position.y, z: equippedTransform.position.z },
    rotation: { x: equippedTransform.rotation.x, y: equippedTransform.rotation.y, z: equippedTransform.rotation.z, w: equippedTransform.rotation.w }
  })
  removeComponent(equipperEntity, EquippedComponent)
  // send unequip to clients
  if(isServer) {
    sendClientObjectUpdate(equipperEntity, NetworkObjectUpdateType.ObjectEquipped, [BinaryValue.FALSE] as EquippedStateUpdateSchema)
  }
}