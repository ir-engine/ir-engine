import { Mesh, Vector3 } from "three";
import { setDefaults } from "../../templates/character/functions/setDefaults";
import { Vec3, Material, Box, Body } from "cannon-es";
import { Component } from "../../ecs/classes/Component";

export class BoxCollider extends Component<BoxCollider>
{
	public options: any;
	public body: Body;
	public debugModel: Mesh;

	constructor(options: any) {
		super();
		const defaults = {
			mass: 0,
			position: new Vector3(),
			size: new Vector3(0.3, 0.3, 0.3),
			friction: 0.3
		};
		options = setDefaults(options, defaults);
		this.options = options;

		options.position = new Vec3(options.position.x, options.position.y, options.position.z);
		options.size = new Vec3(options.size.x, options.size.y, options.size.z);

		const mat = new Material('boxMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		const shape = new Box(options.size);
		// shape.material = mat;

		// Add phys sphere
		const physBox = new Body({
			mass: options.mass,
			position: options.position,
			shape
		});

		physBox.material = mat;

		this.body = physBox;
	}
}