import { Entity } from "../../../ecs/classes/Entity";
import { Vector3 } from "three";
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";

export function getPlayerMovementVelocity(entity:Entity, targetVector?: Vector3): Vector3 {
  const speed = targetVector ?? new Vector3();
  const actor = getComponent(entity, CharacterComponent);

  // TODO: handle speed on moving ground

  speed.copy(actor.velocity).multiplyScalar(actor.moveSpeed).multiply(actor.arcadeVelocityInfluence);

  return speed;
}