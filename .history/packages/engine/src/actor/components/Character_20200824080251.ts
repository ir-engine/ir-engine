// Default component, holds data about what behaviors our character has.

import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
interface JumpPropTypes {
  canJump: boolean
  t?: number
  force?: number
  duration?: number
}

const DefaultJumpData = {
  canJump: true,
  t: 0,
  force: 10,
  duration: 0.5
};



export class Actor extends Component<Actor> {
	public height: number = 0;
	public tiltContainer: Group;
	public modelContainer: Group;
	public materials: Material[] = [];
	public mixer: AnimationMixer;
	public animations: any[];

	// Movement
	public acceleration: Vector3 = new Vector3();
	public velocity: Vector3 = new Vector3();
	public arcadeVelocityInfluence: Vector3 = new Vector3();
	public velocityTarget: Vector3 = new Vector3();I've 
	public arcadeVelocityIsAdditive: boolean = false;

	public defaultVelocitySimulatorDamping: number = 0.8;
	public defaultVelocitySimulatorMass: number = 50;
	public velocitySimulator: VectorSpringSimulator;
	public moveSpeed: number = 4;
	public angularVelocity: number = 0;
	public orientation: Vector3 = new Vector3(0, 0, 1);
	public orientationTarget: Vector3 = new Vector3(0, 0, 1);
	public defaultRotationSimulatorDamping: number = 0.5;
	public defaultRotationSimulatorMass: number = 10;
	public rotationSimulator: RelativeSpringSimulator;
	public viewVector: Vector3;
	public actions: { [action: string]: KeyBinding };
	public characterCapsule: CapsuleCollider;

	// Ray casting
	public rayResult: RaycastResult = new RaycastResult();
	public rayHasHit: boolean = false;
	public rayCastLength: number = 0.57;
	public raySafeOffset: number = 0.03;
	public wantsToJump: boolean = false;
	public initJumpSpeed: number = -1;
	public groundImpactData: GroundImpactData = new GroundImpactData();

	public controlledObject: IControllable;

	public raycastBox: Mesh;
	public charState: ICharacterState;
}

Actor.schema = {
  rotationSpeedX: { type: Types.Number, default: 1 },
  rotationSpeedY: { type: Types.Number, default: 1 },
  maxSpeed: { type: Types.Number, default: 1 },
  accelerationSpeed: { type: Types.Number, default: 0.01 },
  decelerationSpeed: { type: Types.Number, default: 8 },
  jump: { type: Types.Ref, default: DefaultJumpData }
};
