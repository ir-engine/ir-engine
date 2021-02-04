import { Mesh } from "three";
import { Vec3, Material, Sphere, Body } from "cannon-es";
import { Component } from "../../ecs/classes/Component";
import { setDefaults } from "../../templates/character/functions/setDefaults";

export class SphereCollider extends Component<SphereCollider>
{
	public options: any;
	public body: Body;
	public debugModel: Mesh;

	constructor(options: any)
	{
		super();
		const defaults = {
			mass: 0,
			position: new Vec3(),
			radius: 0.3,
			friction: 0.3
		};
		options = setDefaults(options, defaults);
		this.options = options;

		const mat = new Material('sphereMat');
		mat.friction = options.friction;

		const shape = new Sphere(options.radius);
		// shape.material = mat;

		// Add phys sphere
		const physSphere = new Body({
			mass: options.mass,
			position: options.position,
			shape
		});
		physSphere.material = mat;

		this.body = physSphere;
	}
}