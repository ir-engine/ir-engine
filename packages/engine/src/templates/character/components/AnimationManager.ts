// Default component, holds data about what behaviors our actor has.

import { Component } from '../../../ecs/classes/Component';
import { AnimationClip } from 'three';

import GLTFLoader from 'three-gltf-loader';
import { isClient } from "../../../common/functions/isClient";
import { Types } from '../../../ecs/types/Types';

export class AnimationManager extends Component<AnimationManager> {
	static instance: AnimationManager
	public initialized = false

	_animations: AnimationClip[] = []
	getAnimations(): Promise<AnimationClip[]> {
		return new Promise(resolve => {
			if (!isClient) {
				resolve([]);
				return;
			}

			new GLTFLoader().load('models/avatars/Animation.glb', gltf => {
					this._animations = gltf.animations;
					this._animations.forEach(clip => {
						// TODO: make list of morph targets names
						clip.tracks = clip.tracks.filter(track => !track.name.match(/^CC_Base_/));
					});
					resolve(this._animations);
				}
			);
		});
	}

	constructor () {
		super();

		AnimationManager.instance = this;

		this.getAnimations();
	}
}

// DO TO
new AnimationManager();

AnimationManager.schema = {
	animations: { type: Types.Array, default: [] }
};
