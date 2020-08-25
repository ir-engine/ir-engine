import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { addState } from '../../../state/behaviors/StateBehaviors';
/// On Animation ended

export const onAnimationEnded: Behavior = (entity: Entity, args: { transitionToState: any; }, deltaTime) => {
  const character = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (character.timer > character.currentAnimationLength - deltaTime) {
    addState(entity, { state: args.transitionToState });
  }
};
