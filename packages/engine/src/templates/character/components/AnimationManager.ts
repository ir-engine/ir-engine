// Default component, holds data about what behaviors our actor has.

import { Component } from '../../../ecs/classes/Component';
import { Vector3, Group, Material, AnimationMixer, Mesh, BoxBufferGeometry, AnimationAction } from 'three';

import GLTFLoader from 'three-gltf-loader';

export class AnimationManager extends Component<AnimationManager> {
	static instance: AnimationManager
	//public initialized = false
	animations: any

	constructor () {
		super();

		AnimationManager.instance = this;

		 	new GLTFLoader().load('models/avatars/Animation_NoRootMotion.glb', gltf => {
				this.animations = gltf.animations
			}
		)

	}
}

// DO TO
new AnimationManager()

AnimationManager.schema = {
	//animations: { type: Types.Ref, default: null }
};
