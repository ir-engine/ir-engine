import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getMutableComponent, hasComponent, removeComponent, } from "../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { IKComponent } from "../../character/components/IKComponent";
import { Avatar } from "../classes/IKAvatar";
import { AnimationComponent } from "../../character/components/AnimationComponent";

export function initiateIKSystem(entity: Entity) {

  const actor = getMutableComponent(entity, CharacterComponent);
  if(!hasComponent(entity, IKComponent)) {
    addComponent(entity, IKComponent);
  }
  if(hasComponent(entity, AnimationComponent)) {
    removeComponent(entity, AnimationComponent);
  }
  const avatarIK = getMutableComponent(entity, IKComponent);
  console.log(actor.modelContainer)
  avatarIK.avatarIKRig = new Avatar(actor.modelContainer.children[0]);

}