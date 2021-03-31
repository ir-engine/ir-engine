import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions"
import { TransformChildComponent } from "../../transform/components/TransformChildComponent"
import { EquippedComponent } from "../components/EquippedComponent"

export const equipEntity = (equipperEntity, equippedEntity) => {
  addComponent(equipperEntity, EquippedComponent, { equippedEntity: equippedEntity })
  if(!hasComponent(equippedEntity, TransformChildComponent)) {
    addComponent(equippedEntity, TransformChildComponent, { parent: equipperEntity })
    // console.log('equipped!')
  }
}

export const unequipEntity = (equipperEntity) => {
  const equippedComponent = getComponent(equipperEntity, EquippedComponent)
  const equippedEntity = equippedComponent.equippedEntity;
  removeComponent(equippedEntity, TransformChildComponent)
  removeComponent(equipperEntity, EquippedComponent)
  // console.log('unequipped!')
}