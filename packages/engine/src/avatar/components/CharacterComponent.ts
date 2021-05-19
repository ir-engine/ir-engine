// Default component, holds data about what behaviors our actor has.
import { AnimationAction, AnimationMixer, Group, Material, Vector3 } from 'three';
import { SceneQuery } from "three-physx";
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

	// TODO: remove this, model bounds should be calculated entirely from model bounds, not parameters
	public modelScaleHeight = { x: 0.4, y: 0, z: 4 };     // its x - hands, y- height, z - body
	public modelScaleWidth = { x: 0, y: 0, z: 1.2 };     // its x - hands, y- height, z - body
	public modelScaleFactor = { size: 0.3, height: 0.66, radius: 1 };    // calulated then loaded model avatar
	public modelScale = 1; // its for resize

	public movementEnabled = false;
	public initialized = false;
	public state = 0;

	// TODO: Move these... but for now...
	public currentAnimationAction: AnimationAction[] = [];
	public currentAnimationLength = 0;
	public timer = 0;
	public animationsTimeScale = .5;
	public avatarId: string;
	public avatarURL: string;
	public height = 0;
	public tiltContainer: Group;
	public modelContainer: Group;
	public materials: Material[] = [];
	public visible = true;
	public mixer: AnimationMixer;
	public animations: any[] = [];

	// === Movement === //

	public walkSpeed = 0.5;
	public runSpeed = 1;
	public jumpHeight = 4;
	public speedMultiplier = 3;

	/**
	 * desired moving direction from user inputs
	 */
	public localMovementDirection = new Vector3();
	public acceleration: Vector3 = new Vector3();
	/**
	 * this needs to be multiplied by moveSpeed to get real speed;
	 * probably does not represent real physics speed
	 */
	public velocity: Vector3 = new Vector3();
	public arcadeVelocityInfluence: Vector3 = new Vector3(1, 0, 1);
	public velocityTarget: Vector3 = new Vector3();

	public currentInputHash: any = ""

	public defaultVelocitySimulatorDamping = 0.8;
	public defaultVelocitySimulatorMass = 50;
	public velocitySimulator: VectorSpringSimulator
	public animationVectorSimulator: VectorSpringSimulator
	public moveVectorSmooth: VectorSpringSimulator
	public moveSpeed = 1;
	public otherPlayerMaxSpeedCount = 0;
	public angularVelocity = 0;
	public orientation: Vector3 = new Vector3(0, 0, 1);
	public orientationTarget: Vector3 = new Vector3(0, 0, 1);
	public defaultRotationSimulatorDamping = 0.5;
	public defaultRotationSimulatorMass = 10;
	public rotationSimulator: RelativeSpringSimulator;
	public viewVector: Vector3;
	public changedViewAngle = 0;
	public actions: any;

	// Actor collision Capsule
	public actorMass = 1;
	public actorHeight = 1.2;
	public capsuleRadius = 0.25;
	public contactOffset = 0.01;
	public capsuleSegments = 16;
	public capsuleFriction = 0.1;
	public capsulePosition: Vector3 = new Vector3(0, 0, 0);
	// Ray casting
	public raycastQuery: SceneQuery;
	public isGrounded = false;
	public closestHit = null;
	public rayCastLength = 0.85;
	//public raySafeOffset = 0.03;
	//public initJumpSpeed = -1;
	public playerInPortal = 0;
	public animationVelocity: Vector3 = new Vector3();
	public groundImpactVelocity: Vector3 = new Vector3();

	public controlledObject: any;
	public gamepadDamping = 0.05;

	public vehicleEntryInstance: any;
	public occupyingSeat: any;
	quaternion: any;
	canFindVehiclesToEnter: boolean;
	canEnterVehicles: boolean;
	canLeaveVehicles: boolean;
	isJumping: boolean;
	rotationSpeed: any;

	collisionMask: number;

	object = null; // TODO: Rename me to avatar or avatarobject or something
	top = true; // ???
	bottom = true; // ???
	visemes = true;
	hair = true;
	fingers = true;

	static _schema = {
		tiltContainer: { type: Types.Ref, default: null },
		collisionMask: { type: Types.Number, default: DefaultCollisionMask },
		object: { type: Types.Ref, default: null },
		top: { type: Types.Boolean, default: true },
		bottom: { type: Types.Boolean, default: true },
		visemes: { type: Types.Boolean, default: true },
		hair: { type: Types.Boolean, default: true },
		fingers: { type: Types.Boolean, default: true }
	};
}
