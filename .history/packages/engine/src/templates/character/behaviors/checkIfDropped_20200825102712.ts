import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { getComponent, hasComponent } from '../../../ecs/functions/EntityFunctions';
import { addState, hasState } from '../../../state/behaviors/StateBehaviors';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Sprinting } from '../../../character/components/Sprinting';
import { DropRollingState } from '../states/DropRollingState';
import { DropRunningState } from '../states/DropRunningState';
import { SprintState } from '../states/SprintState';
import { WalkState } from '../states/WalkState';
import { DropIdleState } from '../states/DropIdleState';

export const checkIfDropped: Behavior = (entity, args: { transitionToState: any; }, deltaTime) => {
  const character = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (!character.rayHasHit) return;
  
  if (character.groundImpactVelocity.y < -6)
  {
    addState(entity, DropRollingState)
    return
  }
  // TODO: Check if moving -- This won't really work, need to update
  if (character.velocity.length() > (0.1 * deltaTime))
    {
    if (character.groundImpactVelocity.y < -2)
    {
      addState(entity, DropRunningState)
      return
    }
    else
    {
      if (hasComponent(entity, Sprinting))
      {
        addState(entity, SprintState)
        return
      }
      else
      {
        addState(entity, WalkState)
        return
      }
    }
  }
  else
  {
    addState(entity, DropIdleState)
  }
}