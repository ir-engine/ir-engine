import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation, checkFalling } from '../CharacterStateSchema';
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { DefaultStateGroups } from '../CharacterStateGroups';
import { checkMovingOnAnimationEnded } from '../behaviors/checkMovingOnAnimationEnded';
import { WalkState } from './WalkState';
import { EndWalkState } from './EndWalkState';
import { onAnimationEnded } from '../behaviors/onAnimationEnded';

// Idle Behavior
export const DropRunningState: StateSchemaValue = {
  group: DefaultStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      // NOTE: These are copied from DropRolling but aren't set by default (but might need to be)
      // ['velocitySimulator.damping']: 0.6,
      // ['velocitySimulator.mass']: 1,
      ['velocityTarget']: { x: 0.8, y: 0.8, z: 0.8 },
    }
  },
  onEntry: {
    any: [
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setCharacterAnimation,
        args: {
          name: 'drop_running',
          transitionDuration: 0.1
        }
      }
  ]
},
  onUpdate: [
      { behavior: onAnimationEnded,
        args: {
          transitionToState: WalkState
        }
    }
  ]
};
