import { CharacterComponent } from '../components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from "../../../state/behaviors/addState";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { InputType } from '../../../input/enums/InputType';
import { isMovingByInputs } from '../functions/isMovingByInputs';

export const setMovingState: Behavior = (entity, args: { transitionToState: any }, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;
  if(isMovingByInputs(entity)) addState(entity, { state: args.transitionToState });
};
