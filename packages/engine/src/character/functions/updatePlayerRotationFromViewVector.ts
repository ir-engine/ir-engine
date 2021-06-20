import { Vector3 } from "three";
import { applyVectorMatrixXZ } from "../../common/functions/applyVectorMatrixXZ";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { CharacterComponent } from "../components/CharacterComponent";

const forwardVector = new Vector3(0, 0, 1);
const vector3 = new Vector3();

export const updatePlayerRotationFromViewVector = (entity: Entity): void => {
  const actor = getComponent(entity, CharacterComponent);
  const transform = getComponent(entity, TransformComponent);
  vector3.copy(actor.viewVector).setY(0).normalize();
  actor.orientation.copy(applyVectorMatrixXZ(vector3, forwardVector));
  transform.rotation.setFromUnitVectors(forwardVector, actor.orientation.clone().setY(0));
};