import { Character } from "../components/Character";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getMutableComponent, getComponent } from "../../ecs/functions/EntityFunctions";
import { addState, removeState } from "../../state/behaviors/StateBehaviors";
import { DefaultStateTypes } from "../../state/defaults/DefaultStateTypes";

let actor: Character;
let transform: TransformComponent;

export const jump: Behavior = (entity: Entity): void => {
  console.log("jump!")
  actor = getMutableComponent<Character>(entity, Character);
  addState(entity, { state: DefaultStateTypes.JUMPING });
  actor.jump.t = 0;
};

export const jumping: Behavior = (entity: Entity, args, delta: any): void => {
  transform = getComponent<TransformComponent>(entity, TransformComponent);
  actor = getMutableComponent<Character>(entity, Character);
  actor.jump.t += delta;
  if (actor.jump.t < actor.jump.duration) {
    transform.velocity[1] = Math.sin((actor.jump.t / actor.jump.duration) * Math.PI) * actor.jump.force;
  } else {
    removeState(entity, { state: DefaultStateTypes.JUMPING });
  }
};
