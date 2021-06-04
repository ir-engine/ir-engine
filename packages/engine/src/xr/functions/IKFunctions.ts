import { Entity } from "../../ecs/classes/Entity";
import { addComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { IKComponent } from "../../character/components/IKComponent";
import { AnimationComponent } from "../../character/components/AnimationComponent";
import { isClient } from "../../common/functions/isClient";
import { IKRigComponent } from "../../character/components/IKRigComponent";

/**
 * 
 * @author Josh Field <https://github.com/HexaField>
 * @param entity 
 */
export function initiateIK(entity: Entity) {
  addComponent(entity, IKComponent);
  removeComponent(entity, AnimationComponent);
  if(isClient) {
    addComponent(entity, IKRigComponent);
  }
}

/**
 * 
 * @author Josh Field <https://github.com/HexaField>
 * @param entity 
 */
export function stopIK(entity) {
  addComponent(entity, AnimationComponent);
  removeComponent(entity, IKComponent);
  if(isClient) {
    removeComponent(entity, IKRigComponent);
  }
}