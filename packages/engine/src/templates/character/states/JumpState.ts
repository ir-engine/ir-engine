import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from "../behaviors/onAnimationEnded";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { setDropState } from '../behaviors/setDropState';

const jumpRunning: Behavior = (entity: Entity, args: null, delta: any): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	// Physically jump
	if (actor.timer > 0.13 && !actor.alreadyJumped) {
		const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
		actor.wantsToJump = true;
		actor.initJumpSpeed = 1;

		actor.alreadyJumped = true;
		actor.rotationSimulator.damping = 0.3;
		actor.arcadeVelocityIsAdditive = true;
	}
	else if (actor.timer > 0.24) {
		setDropState(entity, null, delta);
	}
};


export const JumpState: StateSchemaValue = {componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 100,
      ['alreadyJumped']: false
    }
  }],
  onEntry:  [
      {
        behavior: initializeCharacterState,
        args: {
          animationId: CharacterStateTypes.JUMP,
          transitionDuration: 0.3
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
    { behavior: jumpRunning },
    {
      behavior: onAnimationEnded,
      args: { transitionToState: CharacterStateTypes.FALLING }
    }
  ]
};
