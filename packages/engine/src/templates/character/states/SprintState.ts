import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation } from "../setCharacterAnimation";
import { checkFalling } from "../behaviors/checkFalling";
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { CharacterStateGroups } from '../CharacterStateGroups';

export const SprintState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 10,
      [' rotationSimulator.damping']: 0.8,
      [' rotationSimulator.mass']: 50,

      ['velocityTarget']: { x: 0, y: 0, z: 1.4 },
    }
  },
  onEntry:  [
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setCharacterAnimation,
        args: {
          name: 'sprint',
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
