// Default component, holds data about what behaviors our actor has.

import { Component } from '../../../ecs/classes/Component';
import { AnimationClip } from 'three';

import GLTFLoader from 'three-gltf-loader';
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
					this.animations.forEach(clip => {
						// TODO: make list of morph targets names
						clip.tracks = clip.tracks.filter(track => !track.name.match(/^CC_Base_/));
					});
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
