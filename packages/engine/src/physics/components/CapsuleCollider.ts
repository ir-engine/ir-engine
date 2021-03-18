import { Vec3, Material, Body, Sphere, Cylinder } from "cannon-es";
import { Component } from "../../ecs/classes/Component";
import { setDefaults } from "../../common/functions/setDefaults";
import { Types } from "../../ecs/types/Types";
import { CollisionGroups } from "../enums/CollisionGroups";

export class CapsuleCollider extends Component<CapsuleCollider>
{
	public options: any;
	public body: Body;
	public mass: number;
	public position: Vec3;
	public height: number;
	public radius: number;
	public segments: number;
	public friction: number;
	public playerStuck: number;
	public moreRaysIchTurn = 0;

	constructor(options: any)
	{
		super(options);
		this.reapplyOptions(options);
	}

	copy(options) {
		const newThis = super.copy(options);

		newThis.reapplyOptions(options);

		return newThis;
	}


	reapplyOptions(options: any) {
		const defaults = {
			mass: 0,
			position: {x: 0, y: 1, z: 0},
			height: 0.5,
			radius: 0.3,
			segments: 8,
			friction: 0
		};
		options = setDefaults(options, defaults);
		this.options = options;

		const mat = new Material('capsuleMat');
		mat.friction = options.friction;

		const capsuleBody = new Body({
			mass: options.mass
		});

		// Compound shape
		const sphereShape = new Sphere(options.radius);
		const cylinderShape = new Cylinder(0.237,0.005,0.5,20);
		// Materials
		capsuleBody.material = mat;

		capsuleBody.addShape(sphereShape, new Vec3(0, 0, 0));
		capsuleBody.addShape(sphereShape, new Vec3(0, options.height / 2, 0));
		capsuleBody.addShape(cylinderShape, new Vec3(0, -options.height / 3 , 0));
		capsuleBody.angularDamping = 0;
		capsuleBody.linearDamping = 0;
	//	capsuleBody.fixedRotation = true;
		//capsuleBody.type = Body.KINEMATIC;
		capsuleBody.collisionFilterGroup = CollisionGroups.Characters;
		capsuleBody.collisionFilterMask = CollisionGroups.Default | CollisionGroups.Characters | CollisionGroups.Car | CollisionGroups.TrimeshColliders;
		capsuleBody.position.set(
      options.position.x,
      options.position.y,
      options.position.z
    );
		this.body = capsuleBody;

	}
}

CapsuleCollider._schema = {
	mass: { type: Types.Number, default: 0 },
	position: { type: Types.Ref, default: new Vec3( 0, 0, 0 ) },
	height: { type: Types.Number, default: 0.5 },
	radius: { type: Types.Number, default: 0.3 },
	segments: { type: Types.Number, default: 8 },
	friction: { type: Types.Number, default: 0.3 },
	playerStuck: { type: Types.Number, default: 1000 }
};
