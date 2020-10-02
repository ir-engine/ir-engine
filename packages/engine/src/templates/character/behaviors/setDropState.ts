import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent, hasComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
import { Sprinting } from '../components/Sprinting';
import { Input } from "../../../input/components/Input";
import { isMoving } from '../functions/isMoving';
import { DefaultInput } from '../../shared/DefaultInput';

export const setDropState: Behavior = (entity, args = null, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  const input = getComponent<Input>(entity, Input as any);
  if(!actor.initialized) return;
  if (!actor.rayHasHit) return
  console.log("Setting drop state")
  console.log("isMoving: ", isMoving(entity))

  if (actor.groundImpactVelocity.y < -6)
  {
    addState(entity, { state: CharacterStateTypes.DROP_ROLLING })
  }


  else if(isMoving(entity))    {
    if (actor.groundImpactVelocity.y < -2)
    {
    //  console.warn('CharacterStateTypes.DROP_RUNNING');
    //  addState(entity, { state: CharacterStateTypes.WALK })

      if (input.data.has(DefaultInput.FORWARD)) {
        addState(entity, { state: CharacterStateTypes.WALK_START_FORWARD})
      } else if (input.data.has(DefaultInput.BACKWARD)) {
        addState(entity, { state: CharacterStateTypes.WALK_START_BACKWARD })
      } else if (input.data.has(DefaultInput.LEFT)) {
        addState(entity, { state: CharacterStateTypes.WALK_START_LEFT })
      } else if (input.data.has(DefaultInput.RIGHT)) {
        addState(entity, { state: CharacterStateTypes.WALK_START_RIGHT})
      }

    }
    else
    {
      if (hasComponent(entity, Sprinting))
      {
        addState(entity, { state: CharacterStateTypes.SPRINT })
      }
      else
      {
        console.warn('CharacterStateTypes.WALK');

        addState(entity, { state: CharacterStateTypes.WALK  })
      }
    }
  }
  else
  {
    console.warn('CharacterStateTypes.DROP_IDLE');
    addState(entity, { state: CharacterStateTypes.DROP_IDLE })
  }
}
