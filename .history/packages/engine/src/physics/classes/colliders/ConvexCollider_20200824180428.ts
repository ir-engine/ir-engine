import {Mesh, Vector3} from 'three';
import {Object3D} from 'three';

export class ConvexCollider implements ICollider
{
	public mesh: any;
	public options: any;
	public body: Body;
	public debugModel: any;

	constructor(mesh: Object3D, options: any)
	{
		this.mesh = mesh.clone();

		let defaults = {
			mass: 0,
			position: mesh.position,
			friction: 0.3
		};
		options = Utils.setDefaults(options, defaults);
		this.options = options;

		let mat = new Material('convMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		if (this.mesh.geometry.isBufferGeometry)
		{
			this.mesh.geometry = new Geometry().fromBufferGeometry(this.mesh.geometry);
		}

		let cannonPoints = this.mesh.geometry.vertices.map((v: Vector3) => {
			return new Vec3( v.x, v.y, v.z );
		});
		
		let cannonFaces = this.mesh.geometry.faces.map((f: any) => {
			return [f.a, f.b, f.c];
		});

		let shape = new ConvexPolyhedron(cannonPoints, cannonFaces);
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