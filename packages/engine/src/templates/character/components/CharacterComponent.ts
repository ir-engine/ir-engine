// Default component, holds data about what behaviors our actor has.
import { Types } from '../../../ecs/types/Types';
import { Component } from '../../../ecs/classes/Component';
import { Vector3, Group, Material, AnimationMixer, Mesh, BoxBufferGeometry, AnimationAction } from 'three';
import { CapsuleCollider } from '../../../physics/components/CapsuleCollider';
import { VectorSpringSimulator } from '../../../physics/classes/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../../../physics/classes/RelativeSpringSimulator';
import { RaycastResult, Vec3 } from 'cannon-es';

// idle|   idle  +  walk     |    walk      |    walk + run     |   run
// 0   | > WALK_START_SPEED  | > WALK_SPEED | > RUN_START_SPEED | > RUN_SPEED
export const WALK_START_SPEED = 0.1;
export const WALK_SPEED = 2;
export const RUN_START_SPEED = 3;
export const RUN_SPEED = 5;

export class CharacterComponent extends Component<CharacterComponent> {

	dispose(): void {
    super.dispose();
		this.modelContainer.parent.remove(this.modelContainer);
		//this.modelContainer = null;
        this.tiltContainer = null;
        // this.cameraMount = null;
  }

	public initialized = false;

// TODO: Move these... but for now...
	public currentAnimationAction: AnimationAction = null;
	public currentAnimationLength = 0;
	public timer = 0;
	public animationsTimeScale = 0.7;

	public height = 0;
	// public cameraMount: Group;
	public tiltContainer: Group;
	public modelContainer: Group;
	public materials: Material[] = [];
  public visible = true;
	public mixer: AnimationMixer;
	public animations: any[]  = [];

  // TODO: Remove integrate this
  public physicsEnabled = true

	// Movement
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
	public arcadeVelocityInfluence: Vector3 = new Vector3();
	public velocityTarget: Vector3 = new Vector3();
	public arcadeVelocityIsAdditive: boolean;

	public currentInputHash: any = ""

	public defaultVelocitySimulatorDamping = 0.8;
	public defaultVelocitySimulatorMass = 50;
	public velocitySimulator: VectorSpringSimulator
	public moveSpeed = WALK_SPEED;
	public angularVelocity = 0;
	public orientation: Vector3 = new Vector3(0, 0, 1);
	public orientationTarget: Vector3 = new Vector3(0, 0, 1);
	public defaultRotationSimulatorDamping = 0.5;
	public defaultRotationSimulatorMass = 10;
	public rotationSimulator: RelativeSpringSimulator;
	public viewVector: Vector3;
	public actions: any;
	public actorCapsule: CapsuleCollider;

	// Actor collision Capsule
	public actorMass = 1;
	public actorHeight = 1;
	public capsuleRadius = 0.25;
	public capsuleSegments = 8;
	public capsuleFriction = 0.0;
	public capsulePosition: Vec3 = new Vec3();

	// Ray casting
	public rayResult: RaycastResult = new RaycastResult();
	public rayHasHit = false;
	public rayCastLength = 0.85; // depends on the height of the actor
	public raySafeOffset = 0.03;
	public wantsToJump = false;
	public initJumpSpeed = -1;
	public groundImpactVelocity: Vector3 = new Vector3();

	public controlledObject: any;

	public raycastBox: Mesh;
  	public vehicleEntryInstance: any;
  	public occupyingSeat: any;
    quaternion: any;
	canFindVehiclesToEnter: boolean;
	canEnterVehicles: boolean;
	canLeaveVehicles: boolean;
  	alreadyJumped: boolean;
  rotationSpeed: any;

}

CharacterComponent._schema = {
	tiltContainer: { type: Types.Ref, default: null },
	// cameraMount: { type: Types.Ref, default: null },
	//modelContainer: { type: Types.Ref, default: null }
};
