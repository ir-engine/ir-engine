import { CharacterComponent } from "../components/CharacterComponent";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";

let actor: CharacterComponent;
let transform: TransformComponent;

const gravity = 9.81;

export const applyGravity: Behavior = (entity: Entity, args, delta: number): void => {
  transform = getComponent<TransformComponent>(entity, TransformComponent);
  actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);

  

  
};
