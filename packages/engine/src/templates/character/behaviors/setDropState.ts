import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent, hasComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
import { Sprinting } from '../components/Sprinting';
import { isMoving } from '../functions/isMoving';

export const setDropState: Behavior = (entity, args = null, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;
  if (!actor.rayHasHit) return;
  console.log("Setting drop state");
  console.log("isMoving: ", isMoving(entity));

  if (actor.groundImpactVelocity.y < -6)
  {
    addState(entity, { state: CharacterStateTypes.DROP_ROLLING });
  }


  else if(isMoving(entity))    {
    if (actor.groundImpactVelocity.y < -2)
    {
      addState(entity, { state: CharacterStateTypes.DROP_RUNNING });
    }
    else
    {
      if (hasComponent(entity, Sprinting))
      {
        addState(entity, { state: CharacterStateTypes.SPRINT });
      }
      else
      {
        addState(entity, { state: CharacterStateTypes.WALK });
      }
    }
  }
  else
  {    
    addState(entity, { state: CharacterStateTypes.DROP_IDLE });
  }
};