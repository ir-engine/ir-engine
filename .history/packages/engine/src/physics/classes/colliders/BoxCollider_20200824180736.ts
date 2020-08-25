export class BoxCollider implements ICollider
{
	public options: any;
	public body: Body;
	public debugModel: Mesh;
	
	constructor(options: any)
	{
		let defaults = {
			mass: 0,
			position: new Vector3(),
			size: new Vector3(0.3, 0.3, 0.3),
			friction: 0.3
		};
		options = setDefaults(options, defaults);
		this.options = options;

		options.position = new Vec3(options.position.x, options.position.y, options.position.z);
		options.size = new Vec3(options.size.x, options.size.y, options.size.z);

		let mat = new Material('boxMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		let shape = new Box(options.size);
		// shape.material = mat;

		// Add phys sphere
		let physBox = new Body({
			mass: options.mass,
			position: options.position,
			shape
		});
		
		physBox.material = mat;

		this.body = physBox;
	}
}