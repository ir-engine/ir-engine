import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getMutableComponent, hasComponent, removeComponent, } from "../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../avatar/components/CharacterComponent";
import { IKComponent } from "../../avatar/components/IKComponent";
import { IKAvatarRig } from "../classes/IKAvatarRig";
import { AnimationComponent } from "../../avatar/components/AnimationComponent";
import { Network } from "../../networking/classes/Network";

/**
 * 
 * @author Josh Field <https://github.com/HexaField>
 * @param entity 
 */
export function initiateIK(entity: Entity) {

  const actor = getMutableComponent(entity, CharacterComponent);
  if(!hasComponent(entity, IKComponent)) {
    addComponent(entity, IKComponent);
  }
  if(hasComponent(entity, AnimationComponent)) {
    removeComponent(entity, AnimationComponent);
  }
  const avatarIK = getMutableComponent(entity, IKComponent);
  avatarIK.avatarIKRig = new IKAvatarRig(actor.modelContainer.children[0], {
    top: true,
    bottom: true,
    visemes: true,
    hair: true,
    fingers: true
  });
  if(Network.instance.localClientEntity === entity) {
    // avatarIK.avatarIKRig.decapitate()
  }

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
  if(hasComponent(entity, IKComponent)) {
    removeComponent(entity, IKComponent);
  }
}