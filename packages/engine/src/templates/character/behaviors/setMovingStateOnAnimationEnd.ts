import { CharacterComponent } from '../components/CharacterComponent';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from "../../../state/behaviors/addState";
import { isMovingByInputs } from '../functions/isMovingByInputs';

export const setMovingStateOnAnimationEnd: Behavior = (entity: Entity, args: { transitionToStateIfMoving: any; transitionToStateIfNotMoving: any }, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (actor.timer > actor.currentAnimationLength - deltaTime) {
    if(isMovingByInputs(entity)) {
      addState(entity, { state: args.transitionToStateIfMoving });
    }
    else {
      addState(entity, { state: args.transitionToStateIfNotMoving });
    }
  }
};
