// Default component, holds data about what behaviors our actor has.
import { Types } from '../../../ecs/types/Types';
import { Component } from '../../../ecs/classes/Component';
import { Vector3, Group, Material, AnimationMixer, Mesh, BoxBufferGeometry, AnimationAction } from 'three';
import { CapsuleCollider } from '../../../physics/components/CapsuleCollider';
import { VectorSpringSimulator } from '../../../physics/classes/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../../../physics/classes/SpringSimulator';
import { RaycastResult, Vec3 } from 'cannon-es';

// idle|   idle  +  walk     |    walk      |    walk + run     |   run
// 0   | > WALK_START_SPEED  | > WALK_SPEED | > RUN_START_SPEED | > RUN_SPEED
export const START_SPEED = 1;
export const WALK_SPEED = 1;
export const RUN_SPEED = 2;

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
	public currentAnimationAction: AnimationAction[] = [];
	public currentAnimationLength = 0;
	public timer = 0;
	public animationsTimeScale = .5;
  public avatarId:string
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

  model: any
  options: {}
  skinnedMeshes: any[]
  flipZ: boolean
  flipY: boolean
  flipLeg: boolean
  allHairBones: any[]
  hairBones: any[]
  fingerBones: any
  tailBones: any
  armature: any
  skeleton: any
  Eye_L: any
  Eye_R: any
  Head: any
  Neck: any
  Chest: any
  Hips: any
  Spine: any
  Left_shoulder: any
  Left_wrist: any
  Left_elbow: any
  Left_arm: any
  Right_shoulder: any
  Right_wrist: any
  Right_elbow: any
  Right_arm: any

  modelBones: any
  poseManager: any
  shoulderTransforms: any
  legsManager: any
  inputs: any
  shoulderWidth: any
  leftArmLength: any
  rightArmLength: any
  lastModelScaleFactor: number
  lastTimestamp: number
  decapitated: boolean
  modelBoneOutputs: any
  volume: number
	outputs: any
	
	update: any
}

CharacterComponent._schema = {
	tiltContainer: { type: Types.Ref, default: null },
	// cameraMount: { type: Types.Ref, default: null },
	//modelContainer: { type: Types.Ref, default: null }
};
