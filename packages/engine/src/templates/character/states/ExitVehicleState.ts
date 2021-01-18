import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimation, setActorAnimationById } from "../behaviors/setActorAnimation";
import { setFallingState } from "../behaviors/setFallingState";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";

export const ExitVehicleState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 50,
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState
    },
    {
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 0 }
    },
    {
      behavior: setActorAnimationById,
      args: {
        animationId: CharacterAnimationsIds.EXITING_CAR,
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
    }
  ]
};
