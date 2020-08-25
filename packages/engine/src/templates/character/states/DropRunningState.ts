import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation } from "../setCharacterAnimation";
import { checkFalling } from "../behaviors/checkFalling";
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { CharacterStateGroups } from '../CharacterStateGroups';
import { WalkState } from './WalkState';
import { onAnimationEnded } from '../behaviors/onAnimationEnded';

export const DropRunningState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      // NOTE: These are copied from DropRolling but aren't set by default (but might need to be)
      // ['velocitySimulator.damping']: 0.6,
      // ['velocitySimulator.mass']: 1,
      ['velocityTarget']: { x: 0, y: 0, z: 0.8 },
    }
  },
  onEntry: [
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
    ],
  onUpdate: [
    {
      behavior: updateCharacterState,
      args: {
        setCameraRelativeOrientationTarget: true
      }
    },
    {
      behavior: onAnimationEnded,
      args: {
        transitionToState: WalkState
      }
    }
  ]
};
