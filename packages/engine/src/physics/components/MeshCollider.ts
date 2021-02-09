import {Object3D} from 'three';
import { threeToCannon } from 'three-to-cannon';
import { Body, Material } from 'cannon-es';
import { Component } from "../../ecs/classes/Component";
import { setDefaults } from "../../common/functions/setDefaults";
export class MeshCollider extends Component<MeshCollider>
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
			rotation: mesh.quaternion,
			friction: 0.3
		};
		options = setDefaults(options, defaults);
		this.options = options;

		const mat = new Material('meshColliderMaterial');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		const shape = threeToCannon(this.mesh, {type: threeToCannon.Type.MESH});
		// shape['material'] = mat;

		// Add phys sphere
		const physBox = new Body({
			mass: options.mass,
			position: options.position,
			quaternion: options.rotation,
			shape: shape
		});

		physBox.material = mat;

		this.body = physBox;
	}
}