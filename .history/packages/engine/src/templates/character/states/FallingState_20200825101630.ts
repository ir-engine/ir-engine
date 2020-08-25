import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation, checkFalling } from '../CharacterStateSchema';
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { DefaultStateGroups } from '../CharacterStateGroups';
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { IdleState } from './IdleState';

// Idle Behavior
export const FallingState: StateSchemaValue = {
  group: DefaultStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.3,
      ['velocitySimulator.mass']: 100,
      ['velocityTarget']: { x: 0.05, y: 0, z: 0.05 },
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
          name: 'falling',
          transitionDuration: 0.3
        }
      }
    ]
  },
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
        transitionToState: IdleState
      }
    },
    {
      behavior: checkFalling
    },
    // Set Velocity Target If Moving

    // Set drop state
  ]
};

export const setTargetVelocityIfMoving: Behavior = (entity, args: {ifTrue: { x: number, y: number, z: number }, ifFalse?: { x: number, y: number, z: number }; }, deltaTime) => {
  const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  // TODO: This won't work if we're falling fast, we need to know if our player is trying to move 
  if (character.velocity.length() > (0.1 * deltaTime)) {
    console.log("Change state to walking forward");
    character.velocityTarget = args.ifTrue
  }
  else if (args.ifFalse !== undefined) character.velocityTarget = args.ifTrue
};
