import { Vector3 } from "three";
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { setState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';

const localSpaceMovementVelocity = new Vector3();

export const trySwitchToMovingState = (entity: Entity): boolean => {
  const actor = getComponent(entity, CharacterComponent);
  if (!actor.initialized) return false;
  if (!actor.rayHasHit) return false; // no switch to movement state while falling

  if (getComponent(entity, CharacterComponent).localMovementDirection.length() === 0 && localSpaceMovementVelocity.length() < 0.01) return false;

  setState(entity, { state: CharacterStateTypes.DEFAULT });
  return true;
};
