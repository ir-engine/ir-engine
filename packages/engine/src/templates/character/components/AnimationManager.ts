// Default component, holds data about what behaviors our actor has.

import { Component } from '../../../ecs/classes/Component';
import { AnimationClip } from 'three';

import { GLTFLoader } from "../../../assets/loaders/gltf/GLTFLoader";
import { isClient } from "../../../common/functions/isClient";
import { Types } from '../../../ecs/types/Types';
import { resolve } from 'url';

export class AnimationManager extends Component<AnimationManager> {
	static instance: AnimationManager
	public initialized = false

	_animations: AnimationClip[] = []
	_animationsList: any
	getAnimations(type: string ='default'): Promise<AnimationClip[]> {
		const animation = 'Animation';
		// TODO: some future logic
		// const animation = type === 'default' ? '' : '_'+type;
		type = 'default';//temporary - for now all avatart uses default animation set
		return new Promise(resolve=>{
			if(this._animationsList && this._animationsList.has(type)){
				console.log('return finded loaded already');
				resolve(this._animationsList.get(type));
			}else{
				if (!isClient) {
					resolve([]);
					return;
				}
				
				new GLTFLoader().load(`/models/avatars/${animation}.glb`, gltf => {
						this._animations = gltf.animations;
						this._animations?.forEach(clip => {
							// TODO: make list of morph targets names
							clip.tracks = clip.tracks.filter(track => !track.name.match(/^CC_Base_/));
						});
						this._animationsList.set(type, this._animations);
						console.log('return and load new one', this._animationsList)
						resolve(this._animations);
					}
				);
			}
		})		
	}
	//TODO: add holder for saving loaded before animations
	constructor () {
		super();
		AnimationManager.instance = this;
		this.getAnimations();
		this._animationsList = new Map();
	}
}

// DO TO
new AnimationManager();

AnimationManager._schema = {
	animations: { type: Types.Array, default: [] },
	// animationsList: { type: Types.Array, default: [] }
};
