import { Actor } from "../components/Actor";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";

let actor: Actor;
let transform: TransformComponent;

const gravity = 9.81;

export const applyGravity: Behavior = (entity: Entity, args, delta: number): void => {
  transform = getComponent<TransformComponent>(entity, TransformComponent);
  actor = getMutableComponent<Actor>(entity, Actor);
  if (transform.position.y > 0) {
    transform.velocity.y = transform.velocity.y - (gravity * (delta * delta)) / 2;
  } else if (transform.velocity.y < 0.00001) {
    transform.velocity.y = 0;
    transform.position.y = 0;
  }
};
