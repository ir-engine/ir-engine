import {Mesh, Vector3, Object3D} from 'three';
import { Material, Vec3, ConvexPolyhedron, Body } from 'cannon-es';
import { Component } from '../../ecs/classes/Component';
import { setDefaults } from "../../common/functions/setDefaults";

export class ConvexCollider extends Component<ConvexCollider>
{
	public mesh: any;
	public options: any;
	public body: Body;
	public debugModel: any;

	constructor(mesh: Object3D, options: any)
	{
		super();
		this.mesh = mesh.clone();

		const defaults = {
			mass: 0,
			position: mesh.position,
			friction: 0.3
		};
		options = setDefaults(options, defaults);
		this.options = options;

		const mat = new Material('convMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		const cannonPoints = this.mesh.geometry.vertices.map((v: Vector3) => {
			return new Vec3( v.x, v.y, v.z );
		});
		
		const cannonFaces = this.mesh.geometry.faces.map((f: any) => {
			return [f.a, f.b, f.c];
		});

		const shape = new ConvexPolyhedron({ vertices: cannonPoints, faces: cannonFaces });
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