import * as THREE from 'three';
import * as Utils from '../../core/FunctionLibrary';
import {
	DropIdle,
	DropRolling,
	DropRunning,
	Falling,
	Sprint,
	StartWalkBackLeft,
	StartWalkBackRight,
	StartWalkForward,
	StartWalkLeft,
	StartWalkRight,
	Walk,
} from './_stateLibrary';
import { Character } from '../Character';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { CharacterComponent } from '../../../components/CharacterComponent';
import { setArcadeVelocityInfluence } from '../../../behaviors/CharacterMovementBehaviors';
import { getMutableComponent } from '../../../../ecs/functions/EntityFunctions';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';

export const initializeCharacterState: Behavior = (entity: Entity) => {
	const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
		character.velocitySimulator.damping = character.defaultVelocitySimulatorDamping;
		character.velocitySimulator.mass = character.defaultVelocitySimulatorMass;

		character.rotationSimulator.damping = character.defaultRotationSimulatorDamping;
		character.rotationSimulator.mass = ts.character.defaultRotationSimulatorMass;

		character.arcadeVelocityIsAdditive = false;
		setArcadeVelocityInfluence(entity, { x: 1, y: 0, z: 1});
})

export abstract class CharacterStateBase implements ICharacterState
{
	public character: Character;
	public timer: number;
	public animationLength: any;

	public canFindVehiclesToEnter: boolean;
	public canEnterVehicles: boolean;
	public canLeaveVehicles: boolean;



	public update(timeStep: number): void
	{
		this.timer += timeStep;
	}

	public checkFalling(): void
	{
		if (!this.character.rayHasHit) { this.character.setState(new Falling(this.character)); }
	}

	public animationEnded(timeStep: number): boolean
	{
		if (this.character.mixer !== undefined)
		{
			if (this.animationLength === undefined)
			{
				console.error(this.constructor.name + 'Error: Set this.animationLength in state constructor!');
				return false;
			}
			else
			{
				return this.timer > this.animationLength - timeStep;
			}
		}
		else { return true; }
	}

	public setAppropriateDropState(): void
	{
		if (this.character.groundImpactData.velocity.y < -6)
		{
			this.character.setState(new DropRolling(this.character));
		}
		else if (this.anyDirection())
		{
			if (this.character.groundImpactData.velocity.y < -2)
			{
				this.character.setState(new DropRunning(this.character));
			}
			else
			{
				if (this.character.actions.run.isPressed)
				{
					this.character.setState(new Sprint(this.character));
				}
				else
				{
					this.character.setState(new Walk(this.character));
				}
			}
		}
		else
		{
			this.character.setState(new DropIdle(this.character));
		}
	}

	public setAppropriateStartWalkState(): void
	{
		let range = Math.PI;
		let angle = Utils.getSignedAngleBetweenVectors(this.character.orientation, this.character.getCameraRelativeMovementVector());

		if (angle > range * 0.8)
		{
			this.character.setState(new StartWalkBackLeft(this.character));
		}
		else if (angle < -range * 0.8)
		{
			this.character.setState(new StartWalkBackRight(this.character));
		}
		else if (angle > range * 0.3)
		{
			this.character.setState(new StartWalkLeft(this.character));
		}
		else if (angle < -range * 0.3)
		{
			this.character.setState(new StartWalkRight(this.character));
		}
		else
		{
			this.character.setState(new StartWalkForward(this.character));
		}
	}

	protected playAnimation(animName: string, fadeIn: number): void
	{
		this.animationLength = this.character.setAnimation(animName, fadeIn);
	}
}