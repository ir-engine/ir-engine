import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getMutableComponent, hasComponent, removeComponent, } from "../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { IKComponent } from "../../templates/character/components/IKComponent";
import { Avatar } from "../classes/IKAvatar";
import { AnimationComponent } from "../../templates/character/components/AnimationComponent";
import { clearBit, setBit } from "../../common/functions/bitFunctions";
import { CHARACTER_STATES } from "../../templates/character/state/CharacterStates";
import { Network } from "../../networking/classes/Network";
import { FollowCameraComponent } from "../../camera/components/FollowCameraComponent";

/**
 * 
 * @author Avaer Kazmer
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
  if(hasComponent(entity, FollowCameraComponent)) {
    removeComponent(entity, FollowCameraComponent);
  }
  const avatarIK = getMutableComponent(entity, IKComponent);
  avatarIK.avatarIKRig = new Avatar(actor.modelContainer.children[0], {
    debug: true,
    top: true,
    bottom: true,
    visemes: true,
    hair: true,
  });
  if(Network.instance.localClientEntity === entity) {
    // avatarIK.avatarIKRig.decapitate()
  }
  actor.state = setBit(actor.state, CHARACTER_STATES.VR);

}

/**
 * 
 * @author Avaer Kazmer
 * @param entity 
 */
export function stopIK(entity) {
  if(!hasComponent(entity, AnimationComponent)) {
    addComponent(entity, AnimationComponent);
  }
  if(!hasComponent(entity, FollowCameraComponent)) {
    addComponent(entity, FollowCameraComponent);
    // TODO: add params for follow cam
  }
  if(hasComponent(entity, IKComponent)) {
    removeComponent(entity, IKComponent);
  }
  const actor = getMutableComponent(entity, CharacterComponent);
  actor.state = clearBit(actor.state, CHARACTER_STATES.VR);
}