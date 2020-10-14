// Default component, holds data about what behaviors our actor has.

import { Component } from '../../../ecs/classes/Component';
import { AnimationClip } from 'three';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { isBrowser } from "../../../common/functions/isBrowser";
import { Types } from '../../../ecs/types/Types';

export class AnimationManager extends Component<AnimationManager> {
	static instance: AnimationManager
	//public initialized = false
	animations: AnimationClip[] = []

	constructor () {
		super();

		AnimationManager.instance = this;

		if (isBrowser) {
			new GLTFLoader().load('models/avatars/Animation_NoRootMotion.glb', gltf => {
					this.animations = gltf.animations;
				}
			);
		}
	}
}

// DO TO
new AnimationManager();

AnimationManager.schema = {
	animations: { type: Types.Array, default: [] }
};
