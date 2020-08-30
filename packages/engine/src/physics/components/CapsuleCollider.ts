import { Vec3, Material, Body, Sphere } from "cannon-es";
import { Component } from "../../ecs/classes/Component";
import { setDefaults } from "../../templates/character/functions/setDefaults";

export class CapsuleCollider extends Component<CapsuleCollider>
{
	public options: any;
	public body: Body;
	// public visual: Mesh;

	constructor(options: any)
	{
		super()
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
			position: options.position
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
}