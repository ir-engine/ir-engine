// Default component, holds data about what behaviors our character has.

import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { Vector3, Group, Material, AnimationMixer, Mesh, BoxGeometry, MeshLambertMaterial } from 'three';
import { CapsuleCollider } from '../../physics/classes/colliders/CapsuleCollider';
import { VectorSpringSimulator } from '../../physics/classes/spring_simulation/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../../physics/components/RelativeSpringSimulator';
import { RaycastResult } from 'cannon-es';
import { CollisionGroups } from '../../physics/enums/CollisionGroups';

const DefaultJumpData = {
  canJump: true,
  t: 0,
  force: 10,
  duration: 0.5
};

export class CharacterComponent extends Component<CharacterComponent> {

// TODO: Move these... but for now...
	public currentAnimationLength: number = 0
	public height: number = 0;
	public tiltContainer: Group;
	public modelContainer: Group;
	public materials: Material[] = [];
	public mixer: AnimationMixer;
	public animations: any[];

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
	public characterCapsule: CapsuleCollider;

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
  
  // TODO: Character Shchema input
  constructor(character, characterSchema: any){
    super();

		// this.readCharacterData(character);
		this.animations = character.animations;

		// The visuals group is centered for easy character tilting
		this.tiltContainer = new Group();
		// this.add(this.tiltContainer);

		// Model container is used to reliably ground the character, as animation can alter the position of the model itself
		this.modelContainer = new Group();
		this.modelContainer.position.y = -0.57;
		this.tiltContainer.add(this.modelContainer);
		this.modelContainer.add(character.scene);

		this.mixer = new AnimationMixer(character.scene);

		this.velocitySimulator = new VectorSpringSimulator(60, this.defaultVelocitySimulatorMass, this.defaultVelocitySimulatorDamping);
		this.rotationSimulator = new RelativeSpringSimulator(60, this.defaultRotationSimulatorMass, this.defaultRotationSimulatorDamping);

		this.viewVector = new Vector3();

		// Actions
		this.actions = characterSchema.actions

		// Physics
		// Player Capsule
		this.characterCapsule = new CapsuleCollider({
			mass: 1,
			position: new Vector3(),
			height: 0.5,
			radius: 0.25,
			segments: 8,
			friction: 0.0
		});
		// capsulePhysics.physical.collisionFilterMask = ~CollisionGroups.Trimesh;
		this.characterCapsule.body.shapes.forEach((shape) => {
			// tslint:disable-next-line: no-bitwise
			shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders
		});
		
		this.characterCapsule.body.allowSleep = false;

		// Move character to different collision group for raycasting
		this.characterCapsule.body.collisionFilterGroup = 2;

		// Disable character rotation
		this.characterCapsule.body.fixedRotation = true;
		this.characterCapsule.body.updateMassProperties();

		// Ray cast debug
		const boxGeo = new BoxGeometry(0.1, 0.1, 0.1);
		const boxMat = new MeshLambertMaterial({
			color: 0xff0000
		});
		this.raycastBox = new Mesh(boxGeo, boxMat);
		this.raycastBox.visible = false;

		// // Physics pre/post step callback bindings
		// this.characterCapsule.body.preStep = (body: Body) => { this.physicsPreStep(body, this); };
		// this.characterCapsule.body.postStep = (body: Body) => { this.physicsPostStep(body, this); };

		// // States
		// this.setState(new Idle(this));
  }
}

CharacterComponent.schema = {
  rotationSpeedX: { type: Types.Number, default: 1 },
  rotationSpeedY: { type: Types.Number, default: 1 },
  maxSpeed: { type: Types.Number, default: 1 },
  accelerationSpeed: { type: Types.Number, default: 0.01 },
  decelerationSpeed: { type: Types.Number, default: 8 },
  jump: { type: Types.Ref, default: DefaultJumpData }
};
