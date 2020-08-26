// Default component, holds data about what behaviors our actor has.

import { Component } from '../../../ecs/classes/Component';
import { Vector3, Group, Material, AnimationMixer, Mesh, BoxGeometry, MeshLambertMaterial } from 'three';
import { CapsuleCollider } from '../../../physics/components/CapsuleCollider';
import { VectorSpringSimulator } from '../../../physics/components/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../../../physics/components/RelativeSpringSimulator';
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
  public physicsEnabled = false

	// Movement
	public acceleration: Vector3 = new Vector3();
	public velocity: Vector3 = new Vector3();
	public arcadeVelocityInfluence: Vector3 = new Vector3();
	public velocityTarget: Vector3 = new Vector3();
	public arcadeVelocityIsAdditive: boolean;

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
  
  // TODO: Actor Shchema input
  constructor(actorSchema: any){
    super();


	// TODO: Initialize properly with schema and set animations from schema
	
		// // this.readActorData(actor);
		// this.animations = actor.animations;

		// // The visuals group is centered for easy actor tilting
		// this.tiltContainer = new Group();
		// // this.add(this.tiltContainer);

		// // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
		// this.modelContainer = new Group();
		// this.modelContainer.position.y = -0.57;
		// this.tiltContainer.add(this.modelContainer);
		// this.modelContainer.add(actor.scene);

		// this.mixer = new AnimationMixer(actor.scene);

		// this.velocitySimulator = new VectorSpringSimulator(60, this.defaultVelocitySimulatorMass, this.defaultVelocitySimulatorDamping);
		// this.rotationSimulator = new RelativeSpringSimulator(60, this.defaultRotationSimulatorMass, this.defaultRotationSimulatorDamping);

		// this.viewVector = new Vector3();

		// // Actions
		// this.actions = actorSchema.actions

		// // Physics
		// // Player Capsule
		// this.actorCapsule = new CapsuleCollider({
		// 	mass: 1,
		// 	position: new Vector3(),
		// 	height: 0.5,
		// 	radius: 0.25,
		// 	segments: 8,
		// 	friction: 0.0
		// });
		// // capsulePhysics.physical.collisionFilterMask = ~CollisionGroups.Trimesh;
		// this.actorCapsule.body.shapes.forEach((shape) => {
		// 	// tslint:disable-next-line: no-bitwise
		// 	shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders
		// });
		
		// this.actorCapsule.body.allowSleep = false;

		// // Move actor to different collision group for raycasting
		// this.actorCapsule.body.collisionFilterGroup = 2;

		// // Disable actor rotation
		// this.actorCapsule.body.fixedRotation = true;
		// this.actorCapsule.body.updateMassProperties();

		// // Ray cast debug
		// const boxGeo = new BoxGeometry(0.1, 0.1, 0.1);
		// const boxMat = new MeshLambertMaterial({
		// 	color: 0xff0000
		// });
		// this.raycastBox = new Mesh(boxGeo, boxMat);
		// this.raycastBox.visible = false;

		// // Physics pre/post step callback bindings
		// this.actorCapsule.body.preStep = (body: Body) => { this.physicsPreStep(body, this); };
		// this.actorCapsule.body.postStep = (body: Body) => { this.physicsPostStep(body, this); };

		// // States
		// this.setState(new Idle(this));
  }
}

CharacterComponent.schema = {
//   rotationSpeedX: { type: Types.Number, default: 1 },
//   rotationSpeedY: { type: Types.Number, default: 1 },
//   maxSpeed: { type: Types.Number, default: 1 },
//   accelerationSpeed: { type: Types.Number, default: 0.01 },
//   decelerationSpeed: { type: Types.Number, default: 8 },
//   jump: { type: Types.Ref, default: DefaultJumpData }
};
