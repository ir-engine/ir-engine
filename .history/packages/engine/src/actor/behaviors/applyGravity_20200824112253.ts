import { Character } from "../components/Character";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";

let actor: Character;
let transform: TransformComponent;

const gravity = 9.81;

export const applyGravity: Behavior = (entity: Entity, args, delta: number): void => {
  transform = getComponent<TransformComponent>(entity, TransformComponent);
  actor = getMutableComponent<Character>(entity, Character);

  


};
