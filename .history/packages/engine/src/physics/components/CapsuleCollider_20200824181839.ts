import { Vec3, Material, Body, Sphere } from "cannon-es";
import { setDefaults } from "../../../character/functions/CharacterFunctions";

export class CapsuleCollider extends Component<BoxCollider>
{
	public options: any;
	public body: Body;
	// public visual: Mesh;

	constructor(options: any)
	{
		super()
		let defaults = {
			mass: 0,
			position: new Vec3(),
			height: 0.5,
			radius: 0.3,
			segments: 8,
			friction: 0.3
		};
		options = setDefaults(options, defaults);
		this.options = options;

		let mat = new Material('capsuleMat');
		mat.friction = options.friction;

		let capsuleBody = new Body({
			mass: options.mass,
			position: options.position
		});

		// Compound shape
		let sphereShape = new Sphere(options.radius);

		// Materials
		capsuleBody.material = mat;
		// sphereShape.material = mat;

		capsuleBody.addShape(sphereShape, new Vec3(0, 0, 0));
		capsuleBody.addShape(sphereShape, new Vec3(0, options.height / 2, 0));
		capsuleBody.addShape(sphereShape, new Vec3(0, -options.height / 2, 0));

		this.body = capsuleBody;
	}
}