import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation } from "../setCharacterAnimation";
import { checkFalling } from "../behaviors/checkFalling";
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { CharacterStateGroups } from '../CharacterStateGroups';
import { jumpIdle } from '../behaviors/jump';

export const JumpIdleState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 50,
      ['velocityTarget']: { x: 0, y: 0, z: 0 },
      ['alreadyJumped']: false
    }
  },
  onEntry: [
    {
      behavior: initializeCharacterState
    },
    {
      behavior: setCharacterAnimation,
      args: {
        name: 'jump_idle',
        transitionDuration: 0.1
      }
    }
  ],
  onUpdate: [
    {
      behavior: updateCharacterState,
      args: {
        setCameraRelativeOrientationTarget: true
      }
    },
    {
      behavior: jumpIdle,
    }
  ]
};
