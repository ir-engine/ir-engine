import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation, checkFalling } from '../CharacterStateSchema';
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { DefaultStateGroups } from '../CharacterStateGroups';
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { IdleState } from './IdleState';
import { StartWalkForwardState } from './StartWalkForwardState';
import { checkMoving } from '../behaviors/checkMoving';

// Idle Behavior
export const DropRollingState: StateSchemaValue = {
  group: DefaultStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.5,
      ['velocitySimulator.mass']: 7,
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
          name: 'drop_rolling',
          transitionDuration: 0.1
        }
      }
  ]
},
  onUpdate: [
    { behavior: updateCharacterState,
      args: {
        setCameraRelativeOrientationTarget: true
      }
    },
    { behavior: checkFalling },
    // TODO: Might not need this since other actions can affect
    { behavior: checkMoving,
    args: {
      transitionToState: StartWalkForwardState
    }
  },
    { behavior: onAnimationEnded,
      args: {
        transitionToState: IdleState
      }
  }]
};
