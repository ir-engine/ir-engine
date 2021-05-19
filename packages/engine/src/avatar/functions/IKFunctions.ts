import { AnimationComponent } from "../../avatar/components/AnimationComponent";
import { CharacterComponent } from "../../avatar/components/CharacterComponent";
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getMutableComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";

/**
 * 
 * @author Josh Field <https://github.com/HexaField>
 * @param entity 
 */
export function initiateIK(entity: Entity) {
  console.log("Initiating IK");
  if(hasComponent(entity, AnimationComponent)) {
    removeComponent(entity, AnimationComponent);
  }
  const ikAvatarRig = getMutableComponent(entity, CharacterComponent);
  ikAvatarRig.object = ikAvatarRig.modelContainer.children[0]; // can be consolidated
}

/**
 * 
 * @author Josh Field <https://github.com/HexaField>
 * @param entity 
 */
export function stopIK(entity) {
  if(!hasComponent(entity, AnimationComponent)) {
    addComponent(entity, AnimationComponent);
  }
  console.log("Deinited IK");
}