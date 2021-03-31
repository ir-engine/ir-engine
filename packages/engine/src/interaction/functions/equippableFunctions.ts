import { Vector3 } from "three"
import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions"
import { ColliderComponent } from "../../physics/components/ColliderComponent"
import { TransformChildComponent } from "../../transform/components/TransformChildComponent"
import { EquippedComponent } from "../components/EquippedComponent"

export const equipEntity = (equipperEntity, equippedEntity) => {
  addComponent(equipperEntity, EquippedComponent, { equippedEntity: equippedEntity })
  if(!hasComponent(equippedEntity, TransformChildComponent)) {
    addComponent(equippedEntity, TransformChildComponent, { parent: equipperEntity, offsetPosition: new Vector3(0, 1, 0) })
    console.log(equippedEntity)
    const collider = getComponent(equippedEntity, ColliderComponent)
    collider.collider.type = 2; //BODY_TYPES.KINEMATIC
    // console.log('equipped!')
  }
}

export const unequipEntity = (equipperEntity) => {
  const equippedComponent = getComponent(equipperEntity, EquippedComponent)
  const equippedEntity = equippedComponent.equippedEntity;
  removeComponent(equippedEntity, TransformChildComponent)
  removeComponent(equipperEntity, EquippedComponent)
  const collider = getComponent(equippedEntity, ColliderComponent)
  collider.collider.type = 1; //BODY_TYPES.DYNAMIC
  // console.log('unequipped!')
}