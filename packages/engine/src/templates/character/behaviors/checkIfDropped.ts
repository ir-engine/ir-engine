import { CharacterComponent } from '../components/CharacterComponent';
import { getComponent, hasComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Sprinting } from '../components/Sprinting';
import { DropRollingState } from '../states/DropRollingState';
import { DropRunningState } from '../states/DropRunningState';
import { SprintState } from '../states/SprintState';
import { WalkState } from '../states/WalkState';
import { DropIdleState } from '../states/DropIdleState';
import { CharacterStateTypes } from '../CharacterStateTypes';

export const checkIfDropped: Behavior = (entity, args: { transitionToState: any; }, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (!actor.rayHasHit) return;
  
  if (actor.groundImpactVelocity.y < -6)
  {
    addState(entity, { state: CharacterStateTypes.DROP_ROLLING })
    return
  }
  // TODO: Check if moving -- This won't really work, need to update
  if (actor.velocity.length() > (0.1 * deltaTime))
    {
    if (actor.groundImpactVelocity.y < -2)
    {
      addState(entity, { state: CharacterStateTypes.DROP_RUNNING })
      return
    }
    else
    {
      if (hasComponent(entity, Sprinting))
      {
        addState(entity, { state: CharacterStateTypes.SPRINT })
        return
      }
      else
      {
        addState(entity, { state: CharacterStateTypes.WALK })
        return
      }
    }
  }
  else
  {
    addState(entity, { state: CharacterStateTypes.DROP_IDLE })
  }
}