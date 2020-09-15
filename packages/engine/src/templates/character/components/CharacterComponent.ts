// Default component, holds data about what behaviors our actor has.

import { Component } from '../../../ecs/classes/Component';
import { Vector3, Group, Material, AnimationMixer, Mesh, BoxBufferGeometry } from 'three';
import { CapsuleCollider } from '../../../physics/components/CapsuleCollider';
import { VectorSpringSimulator } from '../../../physics/classes/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../../../physics/classes/RelativeSpringSimulator';
import { RaycastResult } from 'cannon-es';

export class CharacterComponent extends Component<CharacterComponent> {

	public initialized = false

// TODO: Move these... but for now...
	public currentAnimationLength: number = 0
	public timer = 0

	public height: number = 0;
	public tiltContainer: Group;
	public modelContainer: Group;
	public materials: Material[] = [];
	public mixer: AnimationMixer;
	public animations: any[]  = [];

  // TODO: Remove integrate this
  public physicsEnabled = true

	// Movement
	public localMovementDirection = new Vector3();
	public acceleration: Vector3 = new Vector3();
	public velocity: Vector3 = new Vector3();
	public arcadeVelocityInfluence: Vector3 = new Vector3();
	public velocityTarget: Vector3 = new Vector3();
	public arcadeVelocityIsAdditive: boolean;

	public currentInputHash: any = ""

	public defaultVelocitySimulatorDamping: number = 0.8;
	public defaultVelocitySimulatorMass: number = 50;
	public velocitySimulator: VectorSpringSimulator
	public moveSpeed: number = 4;
	public angularVelocity: number = 0;
	public orientation: Vector3 = new Vector3(0, 0, 1);
	public orientationTarget: Vector3 = new Vector3(0, 0, 1);
	public defaultRotationSimulatorDamping: number = 0.5;
	public defaultRotationSimulatorMass: number = 10;
	public rotationSimulator: RelativeSpringSimulator;
	public viewVector: Vector3;
	public actions: any;
	public actorCapsule: CapsuleCollider;

	// Ray casting
	public rayResult: RaycastResult = new RaycastResult();
	public rayHasHit: boolean = false;
	public rayCastLength: number = 0.57;
	public raySafeOffset: number = 0.03;
	public wantsToJump: boolean = false;
	public initJumpSpeed: number = -1;
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

CharacterComponent.schema = {
	// Fill this out!
};
