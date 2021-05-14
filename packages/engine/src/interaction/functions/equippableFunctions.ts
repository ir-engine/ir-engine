import { Vector3 } from "three"
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
import { EquippedStateUpdateSchema } from "../enums/EquippedEnums"

export const equipEntity = (equipperEntity: Entity, equippedEntity: Entity): void => {

  if(hasComponent(equippedEntity, TransformChildComponent) || hasComponent(equipperEntity, EquippedComponent) || !hasComponent(equippedEntity, NetworkObject)) return; // already equipped or has no collider
  addComponent(equipperEntity, EquippedComponent, { equippedEntity: equippedEntity })
  addComponent(equippedEntity, TransformChildComponent, { parent: equipperEntity, offsetPosition: new Vector3(0, 1, 0) })
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
  removeComponent(equippedEntity, TransformChildComponent)
  removeComponent(equipperEntity, EquippedComponent)
  // send unequip to clients
  if(isServer) {
    sendClientObjectUpdate(equipperEntity, NetworkObjectUpdateType.ObjectEquipped, [BinaryValue.FALSE] as EquippedStateUpdateSchema)
  }
}