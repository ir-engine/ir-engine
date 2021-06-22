// Default component, holds data about what behaviors our actor has.
import { AnimationAction, AnimationMixer, Group, Material, Vector3 } from 'three';
import { RaycastQuery } from "three-physx";
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { RelativeSpringSimulator } from '../../physics/classes/SpringSimulator';
import { VectorSpringSimulator } from '../../physics/classes/VectorSpringSimulator';
import { DefaultCollisionMask } from '../../physics/enums/CollisionGroups';
export class CharacterComponent extends Component<CharacterComponent> {

	dispose(): void {
		super.dispose();
		this.modelContainer.parent.remove(this.modelContainer);
		this.tiltContainer = null;
	}

  // === CORE == //

  /**
   * @property {Group} tiltContainer is a group that ensures the transform is always oriented with Y perpendicular to ground
   * It's center is at the center of the collider
   */
	tiltContainer: Group;

  /**
   * @property {Group} modelContainer is a group that holds the model such that the animations & IK can move seperate from the transform & collider
   * It's center is at the center of the collider, except with y sitting at the bottom of the collider, flush with the ground
   */
	modelContainer: Group;

	movementEnabled = false;
  visible = true; // used for turning model invisble when first person

  // === ANIMATION === // // TODO: Move these to AnimationComponent

	mixer: AnimationMixer;
	animations: any[] = [];
	currentAnimationAction: AnimationAction[] = [];
	currentAnimationLength = 0; // we may not need this

  // === AVATAR === //

	avatarId: string;
	thumbnailURL: string;
	avatarURL: string;
	actorHeight = 1.8;
	actorHalfHeight = 1.8 / 2;

	// === MOVEMENT === //

	isGrounded: boolean;
	isJumping: boolean;
	walkSpeed = 0.5;
	runSpeed = 1;
	jumpHeight = 4;
	speedMultiplier = 3;
	localMovementDirection = new Vector3();
	velocity: Vector3 = new Vector3();
	arcadeVelocityInfluence: Vector3 = new Vector3(1, 0, 1);
	velocityTarget: Vector3 = new Vector3();

	defaultVelocitySimulatorDamping = 0.8;
	defaultVelocitySimulatorMass = 50;
	velocitySimulator: VectorSpringSimulator
	animationVectorSimulator: VectorSpringSimulator
	moveVectorSmooth: VectorSpringSimulator
	moveSpeed = 2;
	otherPlayerMaxSpeedCount = 0;
	angularVelocity = 0;
	animationVelocity: Vector3 = new Vector3();
	orientation: Vector3 = new Vector3(0, 0, 1);
	orientationTarget: Vector3 = new Vector3(0, 0, 1);
	defaultRotationSimulatorDamping = 0.5;
	defaultRotationSimulatorMass = 10;
	rotationSimulator: RelativeSpringSimulator;
	viewVector: Vector3;

	static _schema = {
		avatarId: { type: Types.String, default: null },
		thumbnailURL: { type: Types.String, default: null },
		avatarURL: { type: Types.String, default: null },
	};
}
