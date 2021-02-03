import { Vec3, Material, Body, Sphere } from "cannon-es";
import { Component } from "../../ecs/classes/Component";
import { setDefaults } from "../../templates/character/functions/setDefaults";
import { Types } from "../../ecs/types/Types";
import { PhysicsSystem } from '../systems/PhysicsSystem';

export class CapsuleCollider extends Component<CapsuleCollider>
{
	public options: any;
	public body: Body;
	// public visual: Mesh;
	public mass: number;
	public position: Vec3;
	public height: number;
	public radius: number;
	public segments: number;
	public friction: number;

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
			position: new Vec3(),
			height: 0.5,
			radius: 0.3,
			segments: 8,
			friction: 0.3
		};
		options = setDefaults(options, defaults);
		this.options = options;

		const mat = new Material('capsuleMat');
		mat.friction = options.friction;

		const capsuleBody = new Body({
			mass: options.mass,
			position: new Vec3( options.position.x, options.position.y, options.position.z )
		});

		// Compound shape
		const sphereShape = new Sphere(options.radius);

		// Materials
		capsuleBody.material = mat;
		// sphereShape.material = mat;

		capsuleBody.addShape(sphereShape, new Vec3(0, 0, 0));
		capsuleBody.addShape(sphereShape, new Vec3(0, options.height / 2, 0));
		capsuleBody.addShape(sphereShape, new Vec3(0, -options.height / 2, 0));

		this.body = capsuleBody;
	}

	dispose(): void {
    super.dispose();
    PhysicsSystem.physicsWorld.removeBody(this.body);
  }
}

CapsuleCollider._schema = {
	mass: { type: Types.Number, default: 0 },
	position: { type: Types.Ref, default: new Vec3( 0, 0, 0 ) },
	height: { type: Types.Number, default: 0.5 },
	radius: { type: Types.Number, default: 0.3 },
	segments: { type: Types.Number, default: 8 },
	friction: { type: Types.Number, default: 0.3 },
};
