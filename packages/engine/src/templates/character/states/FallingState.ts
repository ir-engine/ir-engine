import { Entity } from '../../../ecs/classes/Entity';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { setDropState } from '../behaviors/setDropState';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';

export const FallingState: StateSchemaValue = {componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 100,
      ['rotationSimulator.damping']: 0.3
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState,
      args: {
        animationId: CharacterStateTypes.FALLING,
        transitionDuration: 0.5
      }
    }
  ],
  onUpdate: [
    {
      behavior: updateCharacterState
    },
    // Set Velocity Target If Moving
    {
      behavior: ((entity: Entity) => {
        const actor = getComponent(entity, CharacterComponent);
        if (actor.localMovementDirection.length() > 0) {
          actor.velocityTarget.set(0.8, 0.8, 0.8);
        }
        else {
          actor.velocityTarget.set(0, 0, 0);
        }
      })
    },
    // Set drop state
    {
      behavior: setDropState
    }
  ]
};
