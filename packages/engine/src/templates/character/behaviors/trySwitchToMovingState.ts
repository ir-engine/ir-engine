import { CharacterComponent } from '../components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { Entity } from '../../../ecs/classes/Entity';
import { getSignedAngleBetweenVectors } from '../../../common/functions/getSignedAngleBetweenVectors';
import { getCameraRelativeMovementVector } from '../functions/getCameraRelativeMovementVector';
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { setActorAnimation } from "./setActorAnimation";
import { Vector3 } from "three";
import { getPlayerMovementVelocity } from "../functions/getPlayerMovementVelocity";
import { isMovingByInputs } from "../functions/isMovingByInputs";

const localSpaceMovementVelocity = new Vector3();

export const trySwitchToMovingState = (entity: Entity): boolean => {
  const actor = getComponent(entity, CharacterComponent);
  if (!actor.initialized) return false;
  if (!actor.rayHasHit) return false; // no switch to movement state while falling

  getPlayerMovementVelocity(entity, localSpaceMovementVelocity);
  if (!isMovingByInputs(entity) && localSpaceMovementVelocity.length() < 0.01) return false;

  addState(entity, { state: CharacterStateTypes.IDLE });
  return true;
};
