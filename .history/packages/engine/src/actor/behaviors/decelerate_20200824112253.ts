import { Character } from "../components/Character";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";
let actor: Character;
let transform: TransformComponent;
const velocity = new Vector3();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const decelerate: Behavior = (entity: Entity, args: null, delta: number): void => {
//   actor = getComponent<Character>(entity, Character);
//   transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
//   velocity = transform.velocity;
//   if (Math.abs(vec3.length(velocity)) != 0) {
//     velocity *= 1.0 - actor.decelerationSpeed * delta;
//     // Set X and Z so gravity works OK
//     transform.velocity[0] = velocity[0];
//     transform.velocity[2] = velocity[2];
//   }
};
