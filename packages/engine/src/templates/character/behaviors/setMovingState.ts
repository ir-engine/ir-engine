import { CharacterComponent } from '../components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from "../../../state/behaviors/addState";
import { Behavior } from '../../../common/interfaces/Behavior';
import { InputType } from '../../../input/enums/InputType';
import { isMoving } from '../functions/isMoving';

export const setMovingState: Behavior = (entity, args: { transitionToState: any; }, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;
  if(isMoving(entity)) addState(entity, { state: args.transitionToState });
};
