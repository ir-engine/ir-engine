import { AnimationClip, Group, Material, Mesh, SkinnedMesh } from "three";
import { getLoader } from "../../assets/functions/LoadGLTF";
import { isClient } from '../../common/functions/isClient';
import { Engine } from "../../ecs/classes/Engine";


export class AnimationManager {
	static instance: AnimationManager = new AnimationManager();

	_animations: AnimationClip[];
	_defaultModel: Group;
	_defaultSkeleton: SkinnedMesh;

	getAnimations(): Promise<AnimationClip[]> {
		return new Promise(resolve => {
			if (!isClient) {
				resolve([]);
				return;
			}
			if (this._animations) {
				resolve(this._animations);
				return;
			}
			getLoader().load(Engine.publicPath + '/models/avatars/AvatarAnimations.glb', gltf => {
				gltf.scene.traverse((child) => {
					if (child.type === "SkinnedMesh" && !this._defaultSkeleton) {
						this._defaultSkeleton = child;
					}
				});

				//standardizeSkeletion(this._defaultSkeleton);
				this._animations = gltf.animations;
				this._animations?.forEach(clip => {
					// TODO: make list of morph targets names
					clip.tracks = clip.tracks.filter(track => !track.name.match(/^CC_Base_/));
					//console.log(clip)
				});
				resolve(this._animations);
			});
		});
	}
	getDefaultModel(): Promise<Group> {
		return new Promise(resolve => {
			if (this._defaultModel) {
				resolve(this._defaultModel);
				return;
			}
			getLoader().load(Engine.publicPath + '/models/avatars/Default.glb', gltf => {
				console.log('default model loaded');
				this._defaultModel = gltf.scene;
				this._defaultModel.traverse((obj: Mesh) => {
					if (obj.material) {
						(obj.material as Material).transparent = true;
						(obj.material as Material).opacity = 0.5;
					}
				});
				resolve(this._defaultModel);
			});
		});
	}
}
