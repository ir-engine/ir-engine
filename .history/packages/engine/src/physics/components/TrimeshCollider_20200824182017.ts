import {Object3D} from 'three';
import { threeToCannon } from 'three-to-cannon';
import { Body, Material } from 'cannon-es';

export class TrimeshCollider extends Component<TrimeshCollider>
{
	public mesh: any;
	public options: any;
	public body: Body;
	public debugModel: any;

	constructor(mesh: Object3D, options: any)
	{
		super()
		this.mesh = mesh.clone();

		let defaults = {
			mass: 0,
			position: mesh.position,
			rotation: mesh.quaternion,
			friction: 0.3
		};
		options = setDefaults(options, defaults);
		this.options = options;

		let mat = new Material('triMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		let shape = threeToCannon(this.mesh, {type: threeToCannon.Type.MESH});
		// shape['material'] = mat;

		// Add phys sphere
		let physBox = new Body({
			mass: options.mass,
			position: options.position,
			quaternion: options.rotation,
			shape: shape
		});

		physBox.material = mat;

		this.body = physBox;
	}
}