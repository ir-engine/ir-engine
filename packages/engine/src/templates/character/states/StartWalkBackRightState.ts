import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation } from "../setCharacterAnimation";
import { checkFalling } from "../behaviors/checkFalling";
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { CharacterStateGroups } from '../CharacterStateGroups';
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { WalkState } from './WalkState';

export const StartWalkBackRightState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      ['canEnterVehicles']: true,
      ['rotationSimulator.mass']: 20,
      ['rotationSimulator.damping']: 0.7,
      ['arcadeVelocityTarget']: { x: 0.0, y: 0.0, z: 0.8 },
    }
  },
  onEntry: [
    {
      behavior: initializeCharacterState
    },
    {
      behavior: setCharacterAnimation,
      args: {
        name: 'start_back_right',
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
      behavior: checkFalling
    },
    {
      behavior: onAnimationEnded,
      args: {
        transitionToState: WalkState
      }
    }
  ]
};
