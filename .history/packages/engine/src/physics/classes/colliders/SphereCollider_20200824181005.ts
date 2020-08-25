import { Mesh } from "three";
import { Vec3, Material, Sphere, Body } from "cannon-es";
import { setDefaults } from "../../../character/functions/CharacterFunctions";

export class SphereCollider
{
	public options: any;
	public body: Body;
	public debugModel: Mesh;

	constructor(options: any)
	{
		let defaults = {
			mass: 0,
			position: new Vec3(),
			radius: 0.3,
			friction: 0.3
		};
		options = setDefaults(options, defaults);
		this.options = options;

		let mat = new Material('sphereMat');
		mat.friction = options.friction;

		let shape = new Sphere(options.radius);
		// shape.material = mat;

		// Add phys sphere
		let physSphere = new Body({
			mass: options.mass,
			position: options.position,
			shape
		});
		physSphere.material = mat;

		this.body = physSphere;
	}
}