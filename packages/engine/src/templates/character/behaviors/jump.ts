import { CharacterComponent } from "../../../character/components/CharacterComponent";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getMutableComponent, getComponent } from "../../../ecs/functions/EntityFunctions";
import { setCameraRelativeOrientationTarget } from "../../../character/behaviors/CharacterMovementBehaviors";
import { setTargetVelocityIfMoving } from "./setTargetVelocityIfMoving";
import { checkIfDropped } from "./checkIfDropped";
import { onAnimationEnded } from "./onAnimationEnded";
import { FallingState } from "../states/FallingState";

let character: CharacterComponent;
let transform: TransformComponent;

export const initJump: Behavior = (entity, args: { initJumpSpeed: number; }): void => {
  const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  character.wantsToJump = true;
  character.initJumpSpeed = args.initJumpSpeed;
};

export const jumpIdle: Behavior = (entity: Entity, args: null, delta: any): void => {
  transform = getComponent<TransformComponent>(entity, TransformComponent);
  character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  
  // Move in air
  if (character.alreadyJumped)
  {
      setCameraRelativeOrientationTarget(entity);
			setTargetVelocityIfMoving(entity, { ifTrue: { x: 0.8, y: 0.8, z: 0.8 }, ifFalse: { x: 0, y: 0, z: 0 } });
		}

		// Physically jump
		if (character.timer > 0.2 && !character.alreadyJumped)
		{
			initJump(entity, { initJumpSpeed: -1 });
			character.alreadyJumped = true;

			character.velocitySimulator.mass = 100;
			character.rotationSimulator.damping = 0.3;

			if (character.rayResult.body.velocity.length() > 0)
			{
				character.arcadeVelocityInfluence.set(0, 0, 0);
			}
			else
			{
				character.arcadeVelocityInfluence.set(0.3, 0, 0.3);
			}
		}
		else if (character.timer > 0.3)
		{
			checkIfDropped(entity, null, delta);
		}
		else onAnimationEnded(entity, { transitionToState: FallingState }, delta)
  
};

export const jumpRunning: Behavior = (entity: Entity, args: null, delta: any): void => {
  transform = getComponent<TransformComponent>(entity, TransformComponent);
  character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  setCameraRelativeOrientationTarget(entity);
  
		// Move in air
		if (character.alreadyJumped)
		{
			setTargetVelocityIfMoving(entity, { ifTrue: { x: 0.8, y: 0.8, z: 0.8 }, ifFalse: { x: 0, y: 0, z: 0 } });
		}

		// Physically jump
		if (character.timer > 0.13 && !character.alreadyJumped)
		{
			initJump(entity, { initJumpSpeed: 4 });
			character.alreadyJumped = true;
			character.rotationSimulator.damping = 0.3;
			character.arcadeVelocityIsAdditive = true
			character.arcadeVelocityInfluence.set(0.5, 0, 0.5);
			
		}
		else if (character.timer > 0.24)
		{
			checkIfDropped(entity, null, delta);
		}
		else onAnimationEnded(entity, { transitionToState: FallingState }, delta)
  
};