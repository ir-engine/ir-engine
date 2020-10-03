import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { DefaultInput } from '../../shared/DefaultInput';
import { CharacterComponent } from '../components/CharacterComponent';

export const setJumpingState: Behavior = (entity, args: { transitionToState: any; }, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (!actor.initialized) return;
  const input = getComponent(entity, Input);
  if (input.data.has(DefaultInput.JUMP)) {
    addState(entity, { state: args.transitionToState });
  }
};
