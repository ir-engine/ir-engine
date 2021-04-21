import { Vector3 } from "three"
import { BinaryValue } from "../../common/enums/BinaryValue"
import { isServer } from "../../common/functions/isServer"
import { Entity } from "../../ecs/classes/Entity"
import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions"
import { NetworkObject } from "../../networking/components/NetworkObject"
import { sendClientObjectUpdate } from "../../networking/functions/sendClientObjectUpdate"
import { ColliderComponent } from "../../physics/components/ColliderComponent"
import { PhysXBodyType } from "three-physx"
import { PhysicsSystem } from "../../physics/systems/PhysicsSystem"
import { NetworkObjectUpdateType } from "../../templates/networking/NetworkObjectUpdateSchema"
import { TransformChildComponent } from "../../transform/components/TransformChildComponent"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { EquippedComponent } from "../components/EquippedComponent"
import { EquippedStateUpdateSchema } from "../enums/EquippedEnums"

export const equipEntity = (equipperEntity: Entity, equippedEntity: Entity): void => {
  if(hasComponent(equippedEntity, TransformChildComponent) || hasComponent(equipperEntity, EquippedComponent)) return; // already equipped
  addComponent(equipperEntity, EquippedComponent, { equippedEntity: equippedEntity })
  addComponent(equippedEntity, TransformChildComponent, { parent: equipperEntity, offsetPosition: new Vector3(0, 1, 0) })
  const collider = getComponent(equippedEntity, ColliderComponent)
  PhysicsSystem.instance.updateBody(collider.body, { type: PhysXBodyType.KINEMATIC });
  if(isServer) {
    sendClientObjectUpdate(equipperEntity, NetworkObjectUpdateType.ObjectEquipped, [BinaryValue.TRUE, getComponent(equippedEntity, NetworkObject).networkId] as EquippedStateUpdateSchema)
  }
}

export const unequipEntity = (equipperEntity: Entity): void => {
  if(!hasComponent(equipperEntity, EquippedComponent)) return; // already unequipped
  const equippedComponent = getComponent(equipperEntity, EquippedComponent)
  const equippedEntity = equippedComponent.equippedEntity;
  const equippedTransform = getComponent(equippedEntity, TransformComponent)
  const collider = getComponent(equippedEntity, ColliderComponent)
  PhysicsSystem.instance.updateBody(collider.body, { type: PhysXBodyType.KINEMATIC });
  collider.body.updateTransform({
    translation: { x: equippedTransform.position.x, y: equippedTransform.position.y, z: equippedTransform.position.z },
    rotation: { x: equippedTransform.rotation.x, y: equippedTransform.rotation.y, z: equippedTransform.rotation.z, w: equippedTransform.rotation.w }
  })
  removeComponent(equippedEntity, TransformChildComponent)
  removeComponent(equipperEntity, EquippedComponent)
  PhysicsSystem.instance.updateBody(collider.body, { type: PhysXBodyType.DYNAMIC });
  if(isServer) {
    sendClientObjectUpdate(equipperEntity, NetworkObjectUpdateType.ObjectEquipped, [BinaryValue.FALSE] as EquippedStateUpdateSchema)
  }
}