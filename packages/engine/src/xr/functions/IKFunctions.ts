import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getMutableComponent, hasComponent, removeComponent, } from "../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { IKComponent } from "../../character/components/IKComponent";
import { Avatar } from "../classes/IKAvatar";
import { AnimationComponent } from "../../character/components/AnimationComponent";
import { clearBit, setBit } from "../../common/functions/bitFunctions";
import { CHARACTER_STATES } from "../../templates/character/state/CharacterStates";

export function initiateIK(entity: Entity) {

  const actor = getMutableComponent(entity, CharacterComponent);
  if(!hasComponent(entity, IKComponent)) {
    addComponent(entity, IKComponent);
  }
  if(hasComponent(entity, AnimationComponent)) {
    removeComponent(entity, AnimationComponent);
  }
  const avatarIK = getMutableComponent(entity, IKComponent);
  avatarIK.avatarIKRig = new Avatar(actor.modelContainer.children[0]);
  console.log(actor.state)
  actor.state = setBit(actor.state, CHARACTER_STATES.VR);
  console.log(actor.state)

}

export function stopIK(entity) {
  if(!hasComponent(entity, AnimationComponent)) {
    addComponent(entity, AnimationComponent);
  }
  if(hasComponent(entity, IKComponent)) {
    removeComponent(entity, IKComponent);
  }
  const actor = getMutableComponent(entity, CharacterComponent);
  actor.state = clearBit(actor.state, CHARACTER_STATES.VR);
}