import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation } from "../setCharacterAnimation";
import { checkFalling } from "../behaviors/checkFalling";
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { CharacterStateGroups } from '../CharacterStateGroups';

// Idle Behavior
export const IdleState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.6,
      ['velocitySimulator.mass']: 10,
      ['velocityTarget']: { x: 0, y: 0, z: 0 },
    }
  },
  onEntry:  [
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setCharacterAnimation,
        args: {
          name: 'idle',
          transitionDuration: 0.1
        }
      }
  ],
  onUpdate: [
    { behavior: updateCharacterState,
    args: {
      setCameraRelativeOrientationTarget: true
    }
  },
    { behavior: checkFalling }
  ]
};
